# Poll Board Real-time Poll app
The application lets users to create polls and share it with others. Once users cast their vote they can view the results in real-time i.e the poll result graph in Frontend would get updated real-time for all users as votes are being casted.

### Poll API Service
The API server is responsible for all CRUD operations on Poll entity.
### Socket Service
The socket service uses WEBSOCKET [Socket.IO](https://socket.io) . All users are connect to a socket room. The room name is the poll id they are answering for.
### Frontend
As you guessed it is the frontend application build with React as a SPA. It uses the Socket io client for websockets and Plotly for charts. 

## Features Implemented:
### 1. Real-Time Voting and Results Update:
Users can vote on poll options, and as votes are cast, the results update in real-time for all connected users via WebSocket communication.<br>
The frontend uses Plotly for real-time charting of poll results.

### 2. Poll Creation:
A new poll can be created with a title and options. This data is stored in Redis using two structures:<br>
RedisJSON stores essential poll data like the poll ID, title, and options.<br>
Redis Hash stores the vote count for each poll option.

### 3. Real-Time Poll Updates via Redis Pub/Sub:
When a vote is cast:
The backend updates the Redis Hash for the specific poll (incrementing the vote count).<br>
It adds the poll ID to a Redis list (queue), triggering the update in the Socket.io service.<br>
A message is published to a Redis channel (channel:poll), which is consumed by the Socket.io service to broadcast updates to users in the relevant poll room.

### 4. Socket.io Integration:
Users are connected to a unique Socket.io room based on the poll ID they are participating in.<br>
When the vote count is updated in Redis, the Socket service pushes the updated poll data to the room, allowing all users in the room to see the updated results in real-time.

### 5. Poll Result Charting:
The frontend updates a poll result graph in real-time using Plotly, reflecting the current vote count as it changes.

## How the data is stored:

### On Create new Poll  
When a Request to create a new Poll is made we create two data structures in Redis. A RedisJSON and a Hash.  
1. **RedisJSON** (Namespace `Poll:<pollId>`).  
The essential poll data like pollId (entityId), title and poll options are stored as RedisJSON. This cloud be extended to include other meta data related to poll. The app uses **Redis OM** to store the poll data 
```
import { Entity, Schema } from 'redis-om';

class Poll extends Entity {}

const pollSchema = new Schema(
  Poll,
  {
    name: { type: 'string' },
    options: { type: 'string[]' },
    isClosed: { type: 'boolean' },
  },
  { dataStructure: 'JSON' }
);
```
    Below is the create function which stores the data using Redis OM
```
import { Client } from 'redis-om';

const create = async (name: string, options: string[]): Promise<string> => {
  const redisOm = await new Client().use(redis);
  const pollRepo = redisOm.fetchRepository(pollSchema);
  const poll = pollRepo.createEntity()
  poll.name = name;
  poll.options = options;
  poll.isClosed = false;
  const id = await pollRepo.save(poll);
  return id;
};
```
Here's how the created data looks on RedisInsight

2. **Hash** (Namespace `pollBox:<pollId>`).  
This stores the actual vote count for each poll Once the Poll Entity is created we use the same entityId to create the pollBox using the below function to create the hash.
```
const create = async (poll: Poll) => {
  const entityId = poll.entityId;
  const pollBoxId = `pollBox:${entityId}`;
  const promises: Array<Promise<number>> = [];
  poll.options.forEach((option) => {
    promises.push(redis.hSet(pollBoxId, option, 0));
  });
  await Promise.all(promises);
};
```
The actual redis command we are concerned here is `redis.hSet(pollBoxId, option, 0)`. We are storing all the options with initial value as zero under the pollBox id.  

## How the data is accessed
### On Get Poll data
The Frontend makes a GET request with pollId to get the poll data. Since we created the poll data using the Redis OM we can use the same to retrieve the data.
```
const get = async (entityId: string): Promise<Poll> => {
  const redisOm = await new Client().use(redis);
  const pollRepo = redisOm.fetchRepository(pollSchema);
  const poll = await pollRepo.fetch(entityId);
  return poll;
};
```
### On New Vote
This is the place where the real-time part of the application comes into play. For this event we do couple of operations on both the backend services.
- API Service
    1. Update the hash (Increment vote count by one)
    2. LPUSH updated pollId to the queue
    3. Publish an update message to pub/sub
- Socket service
    1. pub/sub receives the update message
    2. RPOP the pollId from Queue
    3. Read latest data from poll hash
    4. Broadcast to socket room.  

**1. Update the hash**  
We increment the poll hash by 1 for the option sent in request payload. Since we have used Redis Hash we can increment with a single command. Below is the function to increment and get the updated hash.  
const update = async (entityId: string, option: string, count: number) => {
  const pollBoxId = `pollBox:${entityId}`;
  await redis.hIncrBy(pollBoxId, option, count);
  const pollBox = await redis.hGetAll(pollBoxId);
  return pollBox;
};
**2. Update the Queue**
```
const QUEUE_NAME = 'queue:polls';
const addPollIdToQueue = async (pollId: string) => {
  await redis.lPush(QUEUE_NAME, pollId);
};
```
The command `redis.lPush(QUEUE_NAME, pollId)` simply pushes the pollId to a Redis list named `queue:polls` later in the socket service we will `rPop` the items from this list thus treating this list like a Queue structure. [Redis List data-types Docs](https://redis.io/docs/data-types/lists/)  

**3. Publish Update to channel**
```
const CHANNEL_NAME = 'channel:poll';
const UPDATE = 'update';
redis.publish(CHANNEL_NAME, UPDATE);
```
The command `redis.publish(CHANNEL_NAME, UPDATE)` simply publishes an update message to the redis pub/sub later this will be consumed in the Socket service.

**Socket Service**  
Socket service is subscribed to the Redis channel `channel:poll`. Once an update message is received from the channel we RPOP the pollId from the queue `queue:polls` and fetch the latest vote count form the hash and broadcasts the same to pollId room.  
**1. Subscribe to Redis pub/sub channel**
```
(async () => {
  const { CHANNEL_NAME } = constants;
  const { POLL_UPDATE } = constants.SOCKET_EVENTS;
  const subscribeClient = redis.duplicate();
  await subscribeClient.connect();
  await subscribeClient.subscribe(CHANNEL_NAME, async (message: string) => {
    const pollId = await popPollQueue();
    const pollBox = await getPollBox(pollId);
    io.to(pollId).emit(POLL_UPDATE, { entityId: pollId, pollBox });
  });
})();
```
The code `subscribeClient.subscribe(channelName, callback)` is the piece which subscribes to the channel and when a new message is received the callback is executed.  

**2. Read Queue**  
As mentioned in the API Service we will RPOP the list to get the updated pollID.
```
// popPollQueue.ts
...
const pollId = await redis.rPop(QUEUE_NAME);
...
```
**3. Read latest data from poll hash**  
```
// getPollBox.ts
...
const pollBoxId = `pollBox:${entityId}`;
const pollBox = await redis.hGetAll(pollBoxId);
...
```
`redis.hGetAll()` gets the complete hash object.

## How to run it locally?
1. git clone <repo-url>
cd poll_app_v1
2. Create a `.env` file in the API service root directory(pollboard-backend-main)
3. Create a `.env` file in the Socket service root directory(pollboard-socket-service-main) inside backend 2
4. Both env file should have the Redis connection string with the name `REDIS_CONNECTION_STRING`
```
// Example .env file
REDIS_CONNECTION_STRING = redis://username:password@redis-11983.c274.us-east-1-3.ec2.cloud.redislabs.com:11983
```
5. Run `npm install` for all folders{<br>
    5.1 cd pollboard-frontend-main<br>
    5.11 cd pollboard-frontend-main<br>
    5.12 npm install<br>

    5.2 cd pollboard-backend-main<br>
    5.21 cd pollboard-backend-main<br>
    5.22 npm install<br>

    5.3 cd pollboard-socket-service-main<br>
    5.31 cd pollboard-socket-service-main<br>
    5.32 npm install<br>
}

6. Run the command `npm run dev` in all the folders

### Prerequisites
> Node.js







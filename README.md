# Poll Board Real-time Poll app
The application lets users to create polls and share it with others. Once users cast their vote they can view the results in real-time i.e the poll result graph in Frontend would get updated real-time for all users as votes are being casted.

### Poll API Service
The API server is responsible for all CRUD operations on Poll entity.
### Socket Service
The socket service uses WEBSOCKET [Socket.IO](https://socket.io) . All users are connect to a socket room. The room name is the poll id they are answering for.
### Frontend
As you guessed it is the frontend application build with React as a SPA. It uses the Socket io client for websockets and Plotly for charts. 

## How to run it locally?
1. git clone <repo-url>
cd poll_app_v1
2. Create a `.env` file in the API service root directory
3. Create a `.env` file in the Socket service root directory
4. Both env file should have the Redis connection string with the name `REDIS_CONNECTION_STRING`
```
// Example .env file
REDIS_CONNECTION_STRING = redis://username:password@redis-11983.c274.us-east-1-3.ec2.cloud.redislabs.com:11983
```
5. Run `npm install` for all folders
6. Run the command `npm run dev` in all the folders

### Prerequisites
> Node.js 


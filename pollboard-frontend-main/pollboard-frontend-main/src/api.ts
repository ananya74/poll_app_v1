import axios from 'axios';
import constants from './constants';

const { API_URL } = constants;
interface AppRes {
  data: any;
  isError: boolean;
  errMsg?: string;
}

export interface Poll {
  name: string;
  options: string[];
  isClosed: boolean;
  entityId?: string;
}
interface PollResData extends AppRes {
  data: {
    poll: Poll;
    pollBox: object;
  };
}

const createPoll = async (poll: Poll): Promise<PollResData> => {
  try {
    const config = {
      method: 'post',
      url: `${API_URL}/poll`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: poll,
    };
    const newPollRes = await axios(config);
    return newPollRes.data as PollResData;
  } catch (error) {
    throw error;
  }
};

const getPoll = async (pollId: string): Promise<PollResData> => {
  try {
    const response = await axios.get(`${API_URL}/poll/${pollId}`);
    return response.data as PollResData;
  } catch (error) {
    throw error;
  }
};

const updatePoll = async (pollId: string, option: string): Promise<any> => {
  try {
    const data = { option };
    const config = {
      method: 'patch',
      url: `${API_URL}/poll-box/${pollId}`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: data,
    };
    const response = await axios(config);
    console.log(response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export { getPoll, updatePoll, createPoll };

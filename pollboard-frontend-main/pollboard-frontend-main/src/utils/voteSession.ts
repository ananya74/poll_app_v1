/**
 * Module to check if a user has voted on a poll
 * The voted polls of user are stored in local storage in the format vote:<pollId> = <answer>
 * Example: if pollId is '12345' and user voted option is 'Tea'
 * The local storage key will be 'vote:12345' with value 'Tea
 */
export const getVote = (pollId: string) => {
  return localStorage.getItem(`vote:${pollId}`) || '';
};

export const setVote = (pollId: string, value: string) => {
  localStorage.setItem(`vote:${pollId}`, value);
};

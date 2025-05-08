import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import io from 'socket.io-client';
import AppBar from './components/AppBar';
import Home from './components/Home';
import PollBox from './components/PollBox';
import CreatePoll from './components/CreatePoll';
import constants from './constants';

const { SOCKET_URL } = constants;
const socket = io(SOCKET_URL, {
  extraHeaders: {
    'my-custom-header': 'abcd',
  },
});

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('pong');
    };
  }, []);

  return (
    <Router>
      <AppBar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/create-poll' element={<CreatePoll />} />
        <Route path='/poll/:pollId' element={<PollBox socket={socket} />} />
        <Route path='*' element={<div>404 Page Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;

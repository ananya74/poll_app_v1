import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { CardActionArea } from '@mui/material';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';

export default function Home() {
  const navigate = useNavigate();
  const pollIdInput = useRef('');
  const [isPollIdDialog, setIsPollIdDialog] = useState(false);
  function CardCreate() {
    return (
      <Card>
        <CardActionArea onClick={() => navigate('/create-poll')}>
          <CardContent>
            <Typography gutterBottom variant='h5' component='div'>
              Create Poll
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Create a new poll and share it with your friends.
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    );
  }

  function CardView() {
    return (
      <Card>
        <CardActionArea onClick={() => setIsPollIdDialog(true)}>
          <CardContent>
            <Typography gutterBottom variant='h5' component='div'>
              Cast votes
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Enter a poll Id to cast your vote and see the results.
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    );
  }

  const gotToPollBox = () => {
    // TODO: Acknowledge pollID validity from backend
    if (pollIdInput.current) {
      navigate(`/poll/${pollIdInput.current}`);
    } else {
      alert('Poll Id not found');
    }
  };
  const handleClose = () => setIsPollIdDialog(false);
  const PollIdDialog = () => {
    return (
      <Dialog open={isPollIdDialog} onClose={handleClose}>
        <DialogTitle>View Poll</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter the poll Id to cast votes and view results.
          </DialogContentText>
          <TextField
            autoFocus
            margin='dense'
            id='poll-id-input'
            type='text'
            fullWidth
            variant='standard'
            onChange={(e) => (pollIdInput.current = e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={gotToPollBox}>View</Button>
        </DialogActions>
      </Dialog>
    );
  };
  return (
    <>
      <PollIdDialog />
      <div style={{ marginTop: '100px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div style={{ width: '100%' }}>
            <Typography style={{ textAlign: 'center' }} variant='h3'>
              Welcome to Poll Board 🗳️
            </Typography>
            <Grid
              style={{
                display: 'flex',
                justifyContent: 'space-evenly',
                marginTop: '20px',
              }}
              container
              spacing={1}
            >
              <Grid item xs={4}>
                <CardCreate />
              </Grid>
              <Grid item xs={4}>
                <CardView />
              </Grid>
            </Grid>
          </div>
        </div>
      </div>
    </>
  );
}

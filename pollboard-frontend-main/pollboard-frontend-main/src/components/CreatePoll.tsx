import { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { createPoll } from '../api';

export default function CreatePoll() {
  const [pollTitle, setPollTitle] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [pollUrl, setPollUrl] = useState('');

  const onItemClear = (index: number) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };
  const handleKeyPress = (event: any) => {
    if (event.key === 'Enter') {
      console.log(event.target.value);
      if (event.target.value) {
        setOptions([...options, String(event.target.value)]);
      } // Clear event
      event.target.value = '';
    }
  };
  const constructPollUrl = (pollId: string) => `/poll/${pollId}`;

  const onCreatePoll = async () => {
    const poll = {
      name: pollTitle,
      options,
      isClosed: false,
    };
    const newPoll = await createPoll(poll);
    setPollTitle('');
    setOptions([]);

    const pollId = newPoll.data.poll.entityId!;
    setPollUrl(constructPollUrl(pollId));
    // Show Poll url
  };

  const isPollData = () => pollTitle || options.length > 0;

  const createdPollData = () => {
    return (
      <>
        <Typography gutterBottom variant='h5' component='div'>
          Poll Data
        </Typography>
        <Typography gutterBottom variant='body2' component='div'>
          Title
        </Typography>
        <Typography gutterBottom variant='h6' component='div'>
          {pollTitle}
        </Typography>
        <Typography gutterBottom variant='body2' component='div'>
          Options list
        </Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableBody>
              {options.map((item, index) => (
                <TableRow key={index}>
                  <TableCell component='th' scope='row'>
                    <IconButton onClick={() => onItemClear(index)}>
                      <CloseOutlinedIcon />
                    </IconButton>
                    {item}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </>
    );
  };
  return (
    <div style={{ padding: '20px' }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <div style={{ padding: '20px' }}>
                <Typography variant='h5'>Create New Poll</Typography>
                <Typography variant='caption'>
                  Poll link will be generated once saved
                </Typography>
                <div style={{ display: 'flex', paddingTop: '20px' }}>
                  <TextField
                    id='text-input-poll-title'
                    label='Poll Title'
                    variant='standard'
                    onChange={(event) => setPollTitle(event.target.value)}
                    value={pollTitle}
                    style={{ flexGrow: '1' }}
                  />
                </div>
                <div style={{ display: 'flex', paddingTop: '10px' }}>
                  <TextField
                    id='text-input-poll-option'
                    label='Poll Option'
                    helperText='Hit Enter key to add Poll options to the list'
                    variant='standard'
                    onKeyPress={handleKeyPress}
                    style={{ flexGrow: '1' }}
                  />
                </div>
                <div style={{ display: 'flex', paddingTop: '30px' }}>
                  <Button
                    variant='contained'
                    size='large'
                    onClick={async () => {
                      await onCreatePoll();
                    }}
                  >
                    Save
                  </Button>
                </div>

                {pollUrl && (
                  <div style={{ paddingTop: '30px' }}>
                    <Typography variant='h6'>
                      Share the poll link with your friends
                    </Typography>
                    <Link href={pollUrl} target={'_blank'} variant='h5'>
                      {`${window.location.origin}${pollUrl}`}
                    </Link>
                  </div>
                )}
                <div style={{ marginTop: '25px' }}>
                  {isPollData() ? (
                    <div>{createdPollData()}</div>
                  ) : (
                    <Typography variant='caption'>
                      Data you enter will appear here
                    </Typography>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}

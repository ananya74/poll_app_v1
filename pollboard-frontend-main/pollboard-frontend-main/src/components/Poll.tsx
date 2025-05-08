import { useEffect, useState } from 'react';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Typography from '@mui/material/Typography';
import { updatePoll } from '../api';
import { getVote, setVote } from '../utils/voteSession';

type Props = {
  pollId: string;
  name: string;
  options: string[];
};
export default function Poll(props: Props) {
  const [value, setValue] = useState(getVote(props.pollId) || '');
  const [isDisabled, setIsDisabled] = useState(
    getVote(props.pollId) ? true : false
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue((event.target as HTMLInputElement).value);
  };

  useEffect(() => {
    if (value && getVote(props.pollId) !== value) {
      updatePoll(props.pollId, value);
      setVote(props.pollId, value);
      setIsDisabled(true);
    }
  }, [value]);

  return (
    <div>
      <Typography variant='h3' textTransform={'capitalize'}>
        {props.name}
      </Typography>
      <FormControl>
        <FormLabel id='demo-controlled-radio-buttons-group'></FormLabel>
        <RadioGroup
          aria-labelledby='demo-controlled-radio-buttons-group'
          name='controlled-radio-buttons-group'
          value={value}
          onChange={handleChange}
        >
          {props.options.map((option: string, index: number) => (
            <FormControlLabel
              disabled={isDisabled}
              key={index}
              value={option}
              control={<Radio />}
              label={option}
            />
          ))}
        </RadioGroup>
      </FormControl>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import axios from 'axios'

export default function SongSearch({ addSong }) {
  const [value, setValue] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState([]);

  useEffect(() => {
    let active = true;

    if (inputValue === '') {
      setOptions(value ? [value] : []);
      return undefined;
    }

    axios.get(`https://us-central1-cotton-eyed-joe.cloudfunctions.net/widgets/validate-song?song=${encodeURIComponent(inputValue)}}`)
      .then((res) => {
        const results = res.data
        if (active) {
          let newOptions = [];

          if (value) {
            newOptions = [value];
          }

          if (results) {
            newOptions = [...newOptions, ...results];
          }

          setOptions(newOptions);
        }
      })
      .catch((error) => {
        console.log('ERROR: ', error)
      })

    return () => {
      active = false;
    };
  }, [value, inputValue]);

  return (
    <Autocomplete
      id="song-search"
      style={{ width: 200 }}
      getOptionLabel={(option) => option.songTitle ? (option.songTitle + ' - ' + option.artists[0]) : option.songTitle}
      filterOptions={(x) => x}
      options={options}
      autoComplete
      filterSelectedOptions
      value={value}
      onChange={(event, newValue) => {
        setOptions(newValue ? [newValue, ...options] : options);
        setValue(newValue)
        addSong(newValue)
      }}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      renderInput={(params) => (
        <TextField {...params} label="Related Song" variant="outlined" />
      )}
      renderOption={(option) => (
        <React.Fragment>
          <img src={option.albumUrl} alt={option.songTitle} width={30} height={30} style={{ paddingRight: 10 }}/>
          {option.songTitle} - {option.artists.map((a) => a.name)}
        </React.Fragment>
      )}
    />
  );
}

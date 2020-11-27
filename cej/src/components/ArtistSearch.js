import React, { useState, useEffect } from 'react'
import TextField from '@material-ui/core/TextField'
import Autocomplete from '@material-ui/lab/Autocomplete'
import CircularProgress from '@material-ui/core/CircularProgress'
import axios from 'axios'

export default function ArtistSearch({ id, addArtist }) {
  const [value, setValue] = useState(null)
  const [inputValue, setInputValue] = useState('')
  const [options, setOptions] = useState([])
  const [open, setOpen] = useState(false)
  const loading = open && options.length === 0

  const openOptions = () => {
    setOpen(!open)
  }

  useEffect(() => {
    let active = true

    if (inputValue === '') {
      setOptions(value ? [value] : [])
      return undefined
    }

    axios.get(`https://us-central1-cotton-eyed-joe.cloudfunctions.net/widgets/validate-artist?artist=${encodeURIComponent(inputValue)}}`)
      .then((res) => {
        const results = res.data
        if (active) {
          let newOptions = []

          if (value) {
            newOptions = [value]
          }

          if (results) {
            newOptions = [...newOptions, ...results]
          }

          setOptions(newOptions)
        }
      })
      .catch((error) => {
        console.log('ARTIST SEARCH ERROR: ', error)
      })

    return () => {
      active = false
    }
  }, [value, inputValue])

  return (
    <Autocomplete
      id={`${id}-search`}
      style={{ width: 200 }}
      getOptionLabel={(option) => option.name}
      filterOptions={(x) => x}
      options={options}
      autoComplete
      filterSelectedOptions
      value={value}
      loading={loading}
      onOpen={openOptions}
      onClose={openOptions}
      onChange={(event, newValue) => {
        setOptions(newValue ? [newValue, ...options] : options)
        setValue(newValue)
        addArtist(newValue)
      }}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue)
      }}
      renderInput={(params) => (
        <TextField
        {...params}
        label={id}
        variant="outlined"
        InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
      renderOption={(option) => (
        <React.Fragment>
          <img src={option.imageUrl} alt={option.name} width={30} height={30} style={{ paddingRight: 10 }}/>
          {option.name}
        </React.Fragment>
      )}
    />
  )
}

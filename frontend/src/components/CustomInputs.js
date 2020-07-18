import React, { useState } from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'
import axios from 'axios'

const MUSIC_RELATIONSHIPS = {
  'collaborator': 'collaborated with',
  'influence': 'was influenced by', // only show on source
  'cover': 'covers',
  'reference': 'references' // only show on source
}

const ARTIST_INFO = ''
const ARTIST_ERROR = 'Artist not found. Must be an exact match.'

const InputTextField = withStyles({
  root: {
    '& label.Mui-focused': {
      color: 'pink',
    },
    '& label': {
      color: 'white',
    },
    '& .MuiOutlinedInput-root': {
      color: 'white',
      '& fieldset': {
        borderColor: 'white',
      },
      '&:hover fieldset': {
        borderColor: 'white',
      },
      '&.Mui-focused fieldset': {
        borderColor: 'pink',
      },
    },
  },
})(TextField);

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  input: {
    margin: theme.spacing(1),
  },
  margin: {
    margin: theme.spacing(1),
  },
  confirm: {
    textAlign: 'center',
  }
}));

export default function CustomInputs() {
  const [artist, setArtist] = useState('')
  const [artistErr, setArtistErr] = useState(false)
  const [artistHelper, setArtistHelper] = useState(ARTIST_INFO)

  const [related, setRelated] = useState('')
  const [relatedErr, setRelatedErr] = useState(false)
  const [relatedHelper, setRelatedHelper] = useState(ARTIST_INFO)

  const [relationship, setRelationship] = useState('')
  const [relationshipErr, setRelationshipErr] = useState(false)
  const [relationshipHelper, setRelationshipHelper] = useState('')

  const [source, setSource] = useState('')
  const [sourceErr, setSourceErr] = useState(false)
  const [sourceHelper, setSourceHelper] = useState('')

  const [song, setSong] = useState(null)
  const [songName, setSongName] = useState('')
  const [songErr, setSongErr] = useState(false)
  const [songHelper, setSongHelper] = useState('')

  const [open, setOpen] = useState(false)

  const classes = useStyles();

  const handleClose = () => {
    setOpen(false)
  }

  function handleSubmit (event) {
    event.preventDefault()
    let cleanSong = song ? song.name : ''
    axios.post('http://localhost:8888/verify', { artist, related, relationship, source, song: cleanSong })
      .then((res) => {
        // TODO: dont open this & also alert
        // TODO: probably here reset all errors to false
        setOpen(true)
      })
      .catch((err) => {
        const errors = err.response.data.fields
        errors.forEach(err => {
          switch (err) {
            case 'artist':
              setArtistErr(true)
              setArtistHelper(ARTIST_ERROR)
              break
            case 'related':
              setRelatedErr(true)
              setRelatedHelper(ARTIST_ERROR)
              break
            case 'relationship':
              setRelationshipErr(true)
              setRelationshipHelper('Required – please select')
              break
            case 'source':
              setSourceErr(true)
              setSourceHelper('Please ensure this field is a URL')
              break
            case 'song':
              setSongErr(true)
              setSongHelper('Unable to find a song by this name.')
              break
            default:
              break
          }
        })
      })
    if (artistErr || relatedErr || sourceErr || songErr) {
      alert('please fix the highlighted errors')
      return
    }
  }

  function handleConfirm () {
    axios.post('http://localhost:8888/insert', { artist, related, relationship, source, song })
      .then(() => {
        window.location.href = 'http://localhost:3000'
      })
  }

  function validateArtists () {
    // check if artist exists on spotify
    axios.get(`http://localhost:8888/validate-artist?artist=${encodeURIComponent(artist)}`)
      .then((res) => {
        setArtist(res.data)
        setArtistErr(false)
        setArtistHelper(ARTIST_INFO)
      })
      .catch((err) => {
        setArtistErr(true)
        setArtistHelper(ARTIST_ERROR)
      })

    axios.get(`http://localhost:8888/validate-artist?artist=${encodeURIComponent(related)}`)
      .then((res) => {
        setRelated(res.data)
        setRelatedErr(false)
        setRelatedHelper(ARTIST_INFO)
      })
      .catch((err) => {
        setRelatedErr(true)
        setRelatedHelper(ARTIST_ERROR)
      })
  }

  function validateSong () {
    // check if song exists on spotify
    if (songName) {
      axios.get(`http://localhost:8888/validate-song?song=${encodeURIComponent(songName)}&artist=${encodeURIComponent(artist)}`)
        .then((res) => {
          setSong(res.data)
          setSongName(res.data.name)
          setSongErr(false)
          setSongHelper('')
        })
        .catch((err) => {
          setSongErr(true)
          setSongHelper('Unable to find a song by this name.')
        })
    }
  }

  function renderConfirmation () {
    if (song) {
      return (
        <DialogContentText id="alert-dialog-description">
          <b>{artist}</b> {MUSIC_RELATIONSHIPS[relationship]} <b>{related}</b> on <br/>
          <img src={song.url} alt={song.album} width={30} height={30}/> {song.name}
        </DialogContentText>
      )
    }
    if (source) {
      return (
        <DialogContentText id="alert-dialog-description">
          <b>{artist}</b> {MUSIC_RELATIONSHIPS[relationship]} <b>{related}</b>,<br/>
          citation: {source}
        </DialogContentText>
      )
    }
  }

  return (
    <form className={classes.root} onSubmit={handleSubmit} noValidate>
      <InputTextField
        className={classes.input}
        label="Artist"
        variant="outlined"
        name="artist"
        value={artist}
        onChange={(e) => setArtist(e.target.value)}
        onBlur={validateArtists}
        error={artistErr}
        helperText={artistHelper}
      />
      <InputTextField
        className={classes.input}
        label="Related Artist"
        variant="outlined"
        name="related"
        value={related}
        onChange={(e) => setRelated(e.target.value)}
        onBlur={validateArtists}
        error={relatedErr}
        helperText={relatedHelper}
      />
      <InputTextField
        className={classes.input}
        label="Relationship"
        variant="outlined"
        name="relationship"
        value={relationship}
        onChange={(e) => setRelationship(e.target.value)}
        style={{width: '75%'}}
        error={relationshipErr}
        helperText={relationshipHelper}
        select
      >
        {Object.keys(MUSIC_RELATIONSHIPS).map((rel) =>
          (<MenuItem key={rel} value={rel}>
            {rel}
          </MenuItem>))}
      </InputTextField>
      <InputTextField
        className={classes.input}
        label="Shared Song"
        variant="outlined"
        name="song"
        value={songName}
        onChange={(e) => setSongName(e.target.value)}
        onBlur={validateSong}
        error={songErr}
        helperText={songHelper}
      />
      <InputTextField
        className={classes.input}
        label="Source"
        variant="outlined"
        name="source"
        fullWidth
        value={source}
        error={sourceErr}
        helperText={sourceHelper}
        onChange={(e) => setSource(e.target.value)}
      />
      <Button
        className={classes.margin}
        type='submit'
        value='Submit'
        variant='contained'
      >
      Submit
      </Button>
      <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Is this information correct?"}</DialogTitle>
          <DialogContent className={classes.confirm}>
            {renderConfirmation()}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} variant="contained" color="primary">
              Nope
            </Button>
            <Button onClick={handleConfirm} variant="contained" color="primary" autoFocus>
              Yes!
            </Button>
          </DialogActions>
        </Dialog>
    </form>
  );
}

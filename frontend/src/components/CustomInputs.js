import React, { useState, useEffect } from 'react'
import { useLocation, Redirect } from 'react-router-dom'
import { makeStyles, withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Grid from '@material-ui/core/Grid'
import Chip from '@material-ui/core/Chip'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import Link from '@material-ui/core/Link'
import Autocomplete from '@material-ui/lab/Autocomplete'

import Switch from '@material-ui/core/Switch'
import axios from 'axios'

const MUSIC_RELATIONSHIPS = [
  { value: 'collaborator', label: 'collaborated with'},
  { value: 'influence', label: 'was influenced by'},
  { value: 'cover', label: 'covered'},
  { value: 'reference', label: 'referenced'}
]

const SONG_ERROR = 'Please select a song.'
const ARTIST_ERROR = 'Artist not found. Must be an exact match.'

const InputTextField = withStyles({
  root: {
    '& label.Mui-focused': {
      color: 'pink',
    },
    '& label': {
      color: 'purple',
    },
    '& .MuiOutlinedInput-root': {
      color: 'purple',
      '& fieldset': {
        borderColor: 'purple',
      },
      '&:hover fieldset': {
        borderColor: 'purple',
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
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  card: {
    minHeight: '75vh',
    maxWidth: 275,
    // margin: 'auto'
  },
  input: {
    margin: theme.spacing(1),
  },
  margin: {
    margin: theme.spacing(1),
  },
  confirm: {
    textAlign: 'center',
  },
  chips: {
    '& > *': {
      margin: theme.spacing(0.5),
    },
  }
}));

export default function ClipperForm() {
  const [val, setVal] = useState({ artist: '', related: '', relationship: '',  song: { albumUrl: '', songTitle: '', artists: [] } })
  const [err, setErr] = useState({ artist: false, related: false, relationship: false, song: false})
  const [helper, setHelper] = useState({ artist: '', related: '', song: ''})

  const [songSearch, setSongSearch] = useState('')

  const [source, setSource] = useState('')
  const [quote, setQuote] = useState('')
  const [title, setTitle] = useState('')
  const [songResults, setResults] = useState([])
  const [renderSong, setRenderSong] = useState(false)
  const [artists, setArtists] = useState([])
  const [renderQuote, setRenderQuote] = useState(true)

  const songLoading = (songResults.length === 0)
  const artistLoading = (artists.length === 0)

  const classes = useStyles()
  const location = useLocation()

  function handleSelect (e, sel) {
    setVal({ ...val, song: sel})
  }

  function handleSelectArtist (e, sel) {
    const key = (e.target.id).split('-')[0]
    setVal({ ...val, [key]: sel})
  }

  async function validate () {
    let hasErr = false
    const errorArray = Object.keys(val).filter((v) => val[v] === '')
    console.log('errorArray: ', errorArray)
    // Object.keys(err).filter((e) => err[e])
    if (renderSong) {
      if (val.song.songName === '') {
        errorArray.push('song')
        hasErr = true
        setHelper({...helper, song: SONG_ERROR})
      }
    }
    if (errorArray.length > 0) {
      hasErr = true
      console.log('error Array: ', errorArray)
      errorArray.forEach((e) => {
        err[e] = true
        console.log('err: ', err)
      })
      setErr(err)
      return
    }

    return hasErr
  }

  async function handleSubmit () {
    // const hasErr = await validate()
    // if (hasErr) return

    const { song, ...values } = val
    let body

    if (renderSong) {
      body = { ...val, source: source, quote: quote, title: title}
    } else {
      body = { ...values, source: source, quote: quote, title: title }
    }

    console.log('posting')
    // TODO: validate input
    axios.post('http://localhost:8888/insert', body)
      .then(() => {
        return <Redirect to={'/'} />
      })
  }

  function validateArtist (e) {
    e.persist()

    axios.get(`http://localhost:8888/validate-artist?artist=${encodeURIComponent(val[e.target.name])}`)
      .then((res) => {
        console.log('setting value: ', res.data)

        setVal({...val, [e.target.name]: res.data})
        setErr({...err, [e.target.name]: false})
        setHelper({...helper, [e.target.name]: ''})
      })
      .catch((error) => {
        setErr({...err, [e.target.name]: true})
        setHelper({...helper, [e.target.name]: ARTIST_ERROR})
      })
  }

  function searchSong (e) {
    e.persist()
    setSongSearch(e.target.value)
    axios.get(`http://localhost:8888/validate-song?song=${encodeURIComponent(e.target.value)}}`)
      .then((res) => {
        setResults(res.data)
        console.log('updated results ', res.data)
      })
      .catch((error) => {
        console.log('ERROR: ', error)
      })
  }

  function renderResultMenu () {
    return (
      <Autocomplete
        id="song-search"
        getOptionLabel={(option) => option.songTitle}
        renderOption={(option) => (
          <React.Fragment>
            <img src={option.albumUrl} alt={option.songTitle} width={30} height={30} style={{ paddingRight: 10 }}/>
            {option.songTitle} by {option.artists}
          </React.Fragment>
        )}
        onChange={handleSelect}
        options={songResults}
        loading={songLoading}
        style={{ width: 200 }}
        renderInput={(params) => (
          <InputTextField
            {...params}
            className={classes.input}
            label="Shared Song"
            variant="outlined"
            name="song"
            value={songSearch}
            onChange={(e) => searchSong(e)}
            error={err.song}
            helperText={helper.song}
          />
        )}
      />
    )
  }

  function handleClick (e) {
    const rel = MUSIC_RELATIONSHIPS.find((r) => r.label === e.target.innerText)
    console.log('rel: ', rel)
    setVal({ ...val, relationship: rel.value })
  }

  function handleSwitch () {
    setRenderSong(!renderSong)
  }

  function getYouTubeId (url) {
    if (!url) return
    const arr = url.split(/(vi\/|v%3D|v=|\/v\/|youtu\.be\/|\/embed\/)/)
    return ((undefined !== arr[2]) ? arr[2].split(/[^\w-]/i)[0] : arr[0])
  }

  useEffect(() => {
    axios.get(`http://localhost:8888/clipped${location.search}`).then((res) => {
      // make this loading and do some error checking
      setQuote(res.data.quote)
      setSource(res.data.pageUrl)
      setTitle(res.data.pageTitle)
      if (res.data.tag === 'video') {
        setRenderQuote(false)
      }
    })
    axios.get('http://localhost:8888/node').then(res => {
      setArtists(res.data.map((a) => a.name))
    })
  }, [location.search])

  return (
    <Grid container alignItems='center' spacing={3}>
      <Grid item xs container>
        <Card className={classes.card}>
          <CardContent>
            {renderQuote ?
              <Typography variant="body1" gutterBottom>
              "{quote}"
            </Typography> :
            <iframe width="80%" title="clipped-video" height="auto" src={`https://www.youtube.com/embed/${getYouTubeId(source)}`}
              frameBorder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen>
            </iframe>
          }
            <Typography variant="subtitle2" style={{color: 'powderblue'}}>
            <Link href={source} color="inherit">
              {title}
            </Link>
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={6} container direction='column' alignItems='center'>
        <Grid item xs>
          What's the relationship here?
        </Grid>
        <Grid item xs>
          <Autocomplete
            id="artist-search"
            getOptionLabel={(option) => option}
            options={artists}
            loading={artistLoading}
            style={{ width: 200 }}
            freeSolo
            blurOnSelect
            onBlur={validateArtist}
            renderInput={(params) => (
              <InputTextField
                {...params}
                className={classes.input}
                label="Artist"
                variant="outlined"
                name="artist"
                value={val.artist}
                onChange={(e) => setVal({...val, artist: e.target.value})}
                error={err.artist}
                helperText={helper.artist}
              />
            )}
          />
        </Grid>
        <Grid item className={classes.chips} xs>
          {MUSIC_RELATIONSHIPS.map((rel) =>
            (<Chip key={rel.label} label={rel.label} clickable onClick={handleClick}
              color={(rel.value === val.relationship ? 'primary': 'default')} />))}
        </Grid>
        <Grid item xs>
          <Autocomplete
            id="related-search"
            getOptionLabel={(option) => option}
            onChange={handleSelectArtist}
            options={artists}
            loading={artistLoading}
            style={{ width: 200 }}
            freeSolo
            blurOnSelect
            onBlur={validateArtist}
            renderInput={(params) => (
              <InputTextField // TODO: allow adding multiple
                {...params}
                className={classes.input}
                label="Related Artist"
                variant="outlined"
                name="related"
                value={val.related}
                onChange={(e) => setVal({...val, related: e.target.value})}
                error={err.related}
                helperText={helper.related}
              />
            )}
          />
        </Grid>
        <Grid item xs>
          <Typography>Is a song mentioned?</Typography>
          <Grid container direction="row" justify="center" alignItems="center">
            <Grid item><Typography>No</Typography></Grid>
            <Grid item>
              <Switch checked={renderSong} onChange={handleSwitch} name="renderSong" />
            </Grid>
            <Grid item><Typography>Yes</Typography></Grid>
          </Grid>
        </Grid>
        {renderSong ? renderResultMenu() : null}
        <Button
          className={classes.margin}
          type='submit'
          value='Submit'
          variant='contained'
          onClick={handleSubmit}
        >
        Submit
        </Button>
      </Grid>
    </Grid>
  );
}

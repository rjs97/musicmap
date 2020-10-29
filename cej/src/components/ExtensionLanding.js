import React, { useState, useEffect } from 'react'
import { useLocation, useHistory } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Grid from '@material-ui/core/Grid'
import Chip from '@material-ui/core/Chip'
import Typography from '@material-ui/core/Typography'
import Link from '@material-ui/core/Link'
import SongSearch from './SongSearch'
import ArtistSearch from './ArtistSearch'
// import IconButton from '@material-ui/core/IconButton'
// import AddBoxIcon from '@material-ui/icons/AddBox'

import Switch from '@material-ui/core/Switch'
import axios from 'axios'

const MUSIC_RELATIONSHIPS = [
  { value: 'collaborator', label: 'collaborated with'},
  { value: 'influence', label: 'was influenced by'},
  { value: 'cover', label: 'covered'},
  { value: 'reference', label: 'referenced'}
]

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  card: {
    minHeight: '75vh',
    maxWidth: 275,
    marginLeft: '25%'
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
    }
  },
  quote: {
    fontFamily: 'ubuntu',
    color: 'slategrey',
    fontSize: 13,
    marginBottom: 5
  },
  src: {
    fontFamily: 'ubuntu',
    fontSize: 11,
    paddingBottom: 10
  },
}));

export default function ExtensionLanding() {

  const [artist, setArtist] = useState(null)
  const [related, setRelated] = useState(null)
  const [relationship, setRelationship] = useState('')
  const [songs, setSongs] = useState([])

  const [source, setSource] = useState('')
  const [quote, setQuote] = useState('')
  const [title, setTitle] = useState('')
  const [renderSong, setRenderSong] = useState(false)
  const [renderVideo, setRenderVideo] = useState(false)

  const classes = useStyles()
  const location = useLocation()
  const history = useHistory()

  let songCount = 0

  async function handleSubmit () {
    console.log('so we shall be sending song: ', songs, 'artist: ', artist, 'related: ', related, 'relationship: ', relationship)

    // TODO: make this nicer
    if (artist === '' || related === '' || relationship === '' || (renderSong && songs.length === 0)) {
      alert('You must fill out each field')
    }

    const body = { artist: artist, related: related, songs: songs, rel: relationship, source: source, quote: quote, title: title}

    console.log('posting')
    axios.post('https://us-central1-cotton-eyed-joe.cloudfunctions.net/widgets/insert', body)
      .then(() => {
        history.push('/')
      })
  }

  function handleClick (e) {
    const rel = MUSIC_RELATIONSHIPS.find((r) => r.label === e.target.innerText)
    setRelationship(rel.value)
  }

  function handleSwitch () {
    setRenderSong(!renderSong)
    setSongs([])
  }

  function getYouTubeId (url) {
    if (!url) return
    const arr = url.split(/(vi\/|v%3D|v=|\/v\/|youtu\.be\/|\/embed\/)/)
    return ((undefined !== arr[2]) ? arr[2].split(/[^\w-]/i)[0] : arr[0])
  }


  // function songFields () {
  //   let fields = []
  //   for (let i = 0; i < songCount; i++) {
  //     fields.push(
  //       <SongSearch id={i} addSong={val => setSongs([...songs, val])}/>
  //     )
  //   }
  //   fields.push(
  //     <Grid item container direction='row' justify='center'>
  //       <SongSearch id={songCount} addSong={val => setSongs([...songs, val])}/>
  //       <IconButton onClick={() => songCount++} style={{ marginLeft: 10 }}><AddBoxIcon/></IconButton>
  //     </Grid>
  //   )
  //   return fields
  // }

  useEffect(() => {
    axios.get(`https://us-central1-cotton-eyed-joe.cloudfunctions.net/widgets/clipped${location.search}`).then((res) => {
      // TODO: make this loading and do some error checking
      setQuote(res.data.quote)
      setSource(res.data.pageUrl)
      setTitle(res.data.pageTitle)
      if (res.data.tag === 'video') {
        setRenderVideo(true)
      }
    })
  }, [location.search])

  return (
    <Grid container alignItems='center' spacing={3}>
      <Grid item xs container>
        <Card className={classes.card}>
          <CardContent>
            <Grid item container alignItems='center'>
              {renderVideo ?
                <Grid item>
                <iframe width="80%" title="clipped-video" height="auto" src={`https://www.youtube.com/embed/${getYouTubeId(source)}`}
                  frameBorder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen>
                </iframe>
                </Grid>
                : <Grid item className={classes.quote}>{`"${quote}"`}</Grid>
              }
              <Grid item container direction='row' justify='flex-end'>
                <Link href={source} target="_blank" className={classes.src} color="inherit">
                  {title}
                </Link>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={6} container direction='column' alignItems='center' spacing={3}>
        <Grid item>What's the relationship here?</Grid>
        <Grid item xs><ArtistSearch id={'Artist'} addArtist={val => setArtist(val)} /></Grid>
        <Grid item className={classes.chips} xs>
          {MUSIC_RELATIONSHIPS.map((rel) =>
            (<Chip key={rel.label} label={rel.label} clickable onClick={handleClick}
              color={(rel.value === relationship ? 'primary': 'default')} />))}
        </Grid>
        <Grid item><ArtistSearch id={'Related'} addArtist={val => setRelated(val)}/></Grid>
        <Grid item>
          <Typography>Is a song mentioned?</Typography>
          <Grid container direction="row" justify="center" alignItems="center">
            <Grid item><Typography>No</Typography></Grid>
            <Grid item>
              <Switch checked={renderSong} onChange={handleSwitch} name="renderSong" />
            </Grid>
            <Grid item><Typography>Yes</Typography></Grid>
          </Grid>
          {renderSong ? <SongSearch id={songCount} addSong={val => setSongs([val])}/> : null}
        </Grid>
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

import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import SongSearch from '../components/SongSearch'
import ArtistSearch from '../components/ArtistSearch'
import IconButton from '@material-ui/core/IconButton'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
// import AddBoxIcon from '@material-ui/icons/AddBox'
import WIPDialog from '../components/WIPDialog'
import Header from '../components/Header'
import Switch from '@material-ui/core/Switch'

import axios from 'axios'

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

export default function AddConnection() {
  const [type, setType] = useState('')
  const [related, setRelated] = useState(null)
  const [song, setSong] = useState(null)
  const [open, setOpen] = useState(false)
  const [artist, addArtist] = useState(false)
  const [artists, setArtists] = useState([])

  const classes = useStyles()
  const history = useHistory()

  function handleSwitch () {
    addArtist(!artist)
  }

  function updSong (val) {
    setSong(val)
    setArtists([...artists, ...val.artists])
  }

  async function handleSubmit () {

    // TODO: make this nicer
    if (song === null) {
      alert('You must fill out each field')
      return
    }

    if (type === 'cover') {
      const body = { artists, related, song, rel: 'cover'}
      axios.post('https://us-central1-cotton-eyed-joe.cloudfunctions.net/widgets/insert_conn', body)
        .then(() => {
          history.push('/')
        })
    } else if (type === 'track_collab') {
      const body = { artists, song, rel: 'collaborator'}
      axios.post('https://us-central1-cotton-eyed-joe.cloudfunctions.net/widgets/insert_conn', body)
        .then(() => {
          history.push('/')
        })
    } else if (type === 'album_collab') {
      // const body = { artist, related: album.artists, album, rel: 'collaborator'}
      // axios.post('https://us-central1-cotton-eyed-joe.cloudfunctions.net/widgets/insert', body)
      //   .then(() => {
      //     history.push('/')
      //   })
      // same as above but w album search that has yet to be created
    }
  }

  function renderMore () {
    return (
      <Grid container direction='column' alignItems='center' style={{ fontSize: 14 }}>
      <Grid item>Collaborators:</Grid>
      <Grid item container direction='row' justify='center' alignItems='center' spacing={3}>
        {song.artists.map((a) => (
          <Grid item key={a.name}>{a.name}</Grid>
        ))}
      </Grid>
      <Grid item> Missing a collaborator? </Grid>
      <Grid item container direction="row" justify="center" alignItems="center">
        <Grid item>No</Grid>
        <Grid item>
          <Switch checked={artist} onChange={handleSwitch} name="renderSong" />
        </Grid>
        <Grid item>Yes</Grid>
      </Grid>
      <Grid item>{artist ? <ArtistSearch id={'Collaborator'} addArtist={val => setArtists([...artists, val])} /> : null }</Grid>
      </Grid>
    )

  }

  function renderSearch () {
    if (type === 'cover') {
      return (
        <Grid container direction='row' justify='center' spacing={3}>
          <Grid item><SongSearch id={'Cover Version'} addSong={val => updSong(val)} /></Grid>
          <Grid item><ArtistSearch id={'Covered Artist'} addArtist={val => setRelated(val)} /></Grid>
        </Grid>
      )
    } else if (type === 'track_collab') {
      return (
        <Grid container direction='column' alignItems='center'>
          <SongSearch id={'Track'} addSong={val => updSong(val)} />
          {song ? renderMore() : null}
        </Grid>
      )
    } else if (type === 'album_collab') {
      return null
      // same as above but w album search that has yet to be created
    }
    return null
  }

  return (
    <Grid container alignItems='center' justify='center' spacing={3}>
      <Grid item style={{ position: 'fixed', top: 0 }}><Header message={'go to map'} link={'/'} /></Grid>
      <p>add a connection</p>
      {(type === '') ?
        <Grid container direction='row' justify='center' spacing={3}>
          <Grid item><Button size='large' color='primary' onClick={() => setType('cover')}>Cover</Button></Grid>
          <Grid item><Button size='large' color='primary' onClick={() => setType('track_collab')}>Track Collab</Button></Grid>
          <Grid item><Button size='large' color='primary' onClick={() => setOpen(true)}>Album Collab</Button></Grid>
        </Grid>
        :
        <Grid container direction='column' alignItems='center'>
          <IconButton onClick={() => setType('')}><ArrowBackIcon/></IconButton>
          {renderSearch()}
          <Button
            className={classes.margin}
            type='submit'
            value='Submit'
            variant='outlined'
            onClick={handleSubmit}
          >
          Submit
          </Button>
        </Grid>
      }
      <WIPDialog setOpen={setOpen} open={open} />
    </Grid>
  );
}

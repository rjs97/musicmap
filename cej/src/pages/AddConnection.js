import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Chip from '@material-ui/core/Chip'
import SongSearch from '../components/SongSearch'
import ArtistSearch from '../components/ArtistSearch'
import AlbumSearch from '../components/AlbumSearch'
import IconButton from '@material-ui/core/IconButton'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import WIPDialog from '../components/WIPDialog'
import Header from '../components/Header'
import Switch from '@material-ui/core/Switch'

import axios from 'axios'

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    width: '80%',
  },
  button: {
    margin: theme.spacing(1),
  },
  chips: {
    '& > *': {
      margin: theme.spacing(0.5),
    }
  },
}));

export default function AddConnection() {
  const [type, setType] = useState('')
  const [coverType, setCoverType] = useState('')
  const [song, setSong] = useState(null)
  const [origSong, setOriginSong] = useState(null)
  const [open, setOpen] = useState(false)
  const [artist, addArtist] = useState(false)
  const [album, setAlbum] = useState(null)
  const [artists, setArtists] = useState([])

  const classes = useStyles()
  const history = useHistory()

  const COVER_TYPES = ['cover', 'sample', 'interpolation']

  function handleSwitch () {
    addArtist(!artist)
  }

  function updSong (val) {
    setSong(val)
    setArtists(val.artists)
  }

  function updRelSong (val) {
    setOriginSong(val)
    setArtists([...artists, ...val.artists])
  }

  function updAlbum (val) {
    setAlbum(val)
    setArtists(val.artists)
  }

  function handleClick (e) { setCoverType(e.target.innerText) }

  async function handleSubmit () {
    if (type === 'cover_adj') {
      if (song === null || origSong === null) {
        alert('You must fill out each field')
        return
      }
      const body = { artists, song, origSong, rel: coverType}
      axios.post('https://us-central1-cotton-eyed-joe.cloudfunctions.net/widgets/insert-cover', body)
        .then(() => {
          history.push('/')
        })
    } else if (type === 'track_collab') {
      if (song === null) {
        alert('You must fill out each field')
        return
      }
      const body = { artists, content: song, rel: 'collaborator'}
      axios.post('https://us-central1-cotton-eyed-joe.cloudfunctions.net/widgets/insert-collab', body)
        .then(() => {
          history.push('/')
        })
    } else if (type === 'album_collab') {
      if (album === null) {
        alert('You must fill out each field')
        return
      }

      const body = { artists, content: album, rel: 'collaborator'}
      axios.post('https://us-central1-cotton-eyed-joe.cloudfunctions.net/widgets/insert-collab', body)
        .then(() => {
          history.push('/')
        })
    }
  }

  function renderCollabs () {
    return (
      <Grid container direction='column' alignItems='center' style={{ fontSize: 14 }}>
      <Grid item>Collaborators:</Grid>
      <Grid item container direction='row' justify='center' alignItems='center' spacing={3}>
        {artists.map((a) => (
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

  function renderCover () {
    return (
      <Grid container direction='column'>
        <Grid item container direction='row' justify='center' spacing={3}>
          <Grid item><SongSearch id={`${coverType} version`} addSong={val => updSong(val)} /></Grid>
          <Grid item><SongSearch id={'original version'} addSong={val => updRelSong(val)} /></Grid>
        </Grid>
      </Grid>
    )
  }

  function renderSearch () {
    if (type === 'cover_adj') {
      return (
        <Grid container direction='column' alignItems='center' justify='center' spacing={3}>
          <Grid item style={{ fontSize: 13 }}>can you be a little more specific about the relationship?</Grid>
          <Grid item container direction='row' justify='center' className={classes.chips}>
             {COVER_TYPES.map((ty) => (
               <Chip key={ty} label={ty} clickable onClick={handleClick}
                  color={(coverType === ty ? 'primary': 'default')} />
             ))}
          </Grid>
          <Grid item>{(coverType === '') ? null : renderCover()}</Grid>
        </Grid>
      )
    } else if (type === 'track_collab') {
      return (
        <Grid container direction='column' alignItems='center'>
          <SongSearch id={'Track'} addSong={val => updSong(val)} />
          {song ? renderCollabs() : null}
        </Grid>
      )
    } else if (type === 'album_collab') {
      return (
        <Grid container direction='column' alignItems='center'>
          <AlbumSearch id={'Album'} addAlbum={val => updAlbum(val)} />
          { album ? renderCollabs() : null }
        </Grid>
      )
    }
    return null
  }

  return (
    <Grid container direction='column' alignItems='center' justify='center' spacing={3} className={classes.root}>
      <Grid item container justify='center' style={{ position: 'fixed', top: 0, width: '80%'}}>
        <Header message={'go to map'} link={'/'}/>
      </Grid>
      <Grid item>add a connection</Grid>
      {(type === '') ?
        <Grid item container direction='row' justify='center' spacing={3}>
          <Grid item><Button size='large' color='primary' onClick={() => setType('cover_adj')}>Cover / Sample</Button></Grid>
          <Grid item><Button size='large' color='primary' onClick={() => setType('track_collab')}>Track Collab</Button></Grid>
          <Grid item><Button size='large' color='primary' onClick={() => setType('album_collab')}>Album Collab</Button></Grid>
          <Grid item><Button size='large' color='primary' onClick={() => setOpen(true)}>Lyric Reference</Button></Grid>
        </Grid>
        :
        <Grid item container direction='column' alignItems='center'>
          <IconButton onClick={() => setType('')}><ArrowBackIcon/></IconButton>
          {renderSearch()}
          <Button
            className={classes.button}
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
  )
}

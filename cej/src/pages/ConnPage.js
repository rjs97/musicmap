import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Chip from '@material-ui/core/Chip'
import Grid from '@material-ui/core/Grid'
import Link from '@material-ui/core/Link'
import CircularProgress from '@material-ui/core/CircularProgress'
import Header from '../components/Header'
import axios from 'axios'

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    width: '80%',
  },
  rel: {
    fontFamily: 'ubuntu',
    color: 'slategrey',
    fontSize: 16,
  },
  title: {
    fontFamily: 'ubuntu',
    color: 'black',
    fontSize: 18,
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
}))

const MUSIC_RELATIONSHIPS = {
  'collaborator': 'collaborated with',
  'influence': 'influenced',
  'reference': 'was referenced by',
  'cover': 'was covered by',
  'covered': 'covered',
  'sample': 'was sampled by',
  'sampled': 'sampled',
  'interpolation': 'was interpolated by',
  'interpolated': 'interpolated'
}

const YOUTUBE_REGEX = new RegExp('^(https?://)?(www.)?(youtube.com|youtu.?be)/.+$')

const ConnPage = () => {
  const classes = useStyles()
  const [data, setData] = useState(null)
  const [artist, setArtist] = useState('')
  const [related, setRelated] = useState('')

  const { linkid, type, id } = useParams()

  useEffect(() => {
    axios.get(`https://us-central1-cotton-eyed-joe.cloudfunctions.net/widgets/relationships?linkId=${linkid}&type=${type}&id=${id}`).then(res => {
      setData(res.data[type])
      setArtist(res.data.artist)
      setRelated(res.data.related)
    })
  }, [id, linkid, type])

  const renderContent = (content) => {
    if (content.album) {
      return (
        <Grid item container direction='row' justify='center' alignItems='center' spacing={3} className={classes.rel}>
          <Grid item xs={3}>
            <iframe
              src={`https://open.spotify.com/embed/track/${content.id}`}
              width="80"
              height="80"
              title={content.name}
              frameBorder="0"
              allowtransparency="true"
              allow="encrypted-media"
            />
          </Grid>
          <Grid item xs={9}>{content.name}, {content.album}</Grid>
        </Grid>
      )
    } else {
      return (
        <Grid item container direction='row' justify='center' alignItems='center' spacing={3} className={classes.rel}>
          <Grid item xs={3}>
            <iframe
              src={`https://open.spotify.com/embed/album/${content.id}`}
              width="80"
              height="80"
              title={content.name}
              frameBorder="0"
              allowtransparency="true"
              allow="encrypted-media"
            />
          </Grid>
          <Grid item xs={9}>ALBUM: {content.name}</Grid>
        </Grid>
      )
    }
  }

  const renderCover = () => {
    return (
      <Grid item container direction='column' alignItems='center' justify='center'>
      <Grid item container direction='row' justify='center' alignItems='center' spacing={3} className={classes.title}>
        <Grid item>{related}</Grid>
        <Grid item>
          <Chip key={data.type} label={MUSIC_RELATIONSHIPS[data.type]} />
        </Grid>
        <Grid item>{artist}</Grid>
      </Grid>
      <Grid item container direction='row' justify='center' alignItems='center' className={classes.rel}>
        <Grid container item direction='column' xs={6} alignItems='center'>
          <Grid item>
          { YOUTUBE_REGEX.test(data.track.src) ?
            <iframe
              src={`https://www.youtube.com/embed/${data.track.id}`}
              width="80"
              height="80"
              title={data.track.name}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            />
            : <iframe
            src={`https://open.spotify.com/embed/track/${data.track.id}`}
            width="80"
            height="80"
            title={data.track.name}
            frameBorder="0"
            allowtransparency="true"
            allow="encrypted-media"
          />}</Grid>
          <Grid item>{data.track.name}</Grid>
        </Grid>
        <Grid container item direction='column' xs={6} alignItems='center'>
          <Grid item><iframe
            src={`https://open.spotify.com/embed/track/${data.origTrack.id}`}
            width="80"
            height="80"
            title={data.origTrack.name}
            frameBorder="0"
            allowtransparency="true"
            allow="encrypted-media"
          /></Grid>
          <Grid item>{data.origTrack.name}</Grid>
        </Grid>
      </Grid>
      </Grid>
    )
  }

  const renderRef = () => {
    return (
      <Grid item container direction='column'>
      <Grid item container direction='row' justify='center' alignItems='center' spacing={3} className={classes.title}>
        <Grid item>{related}</Grid>
        <Grid item>
          <Chip key={data.type} label={MUSIC_RELATIONSHIPS[data.type]} />
        </Grid>
        <Grid item>{artist}</Grid>
      </Grid>
      {data.content ? renderContent(data.content) : null }
      {data.quote ?
        <Grid item className={classes.quote}>"{data.quote}"</Grid>
        : YOUTUBE_REGEX.test(data.url) ? <iframe
          src={`https://www.youtube.com/embed/${data.id}`}
          width="80"
          height="80"
          title={data.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        />
        : null
      }
      <Grid item container direction='row' justify='flex-end'>
        <Link href={data.url} target="_blank" className={classes.src} color="inherit">
          {data.title}
        </Link>
      </Grid>
    </Grid>
    )
  }

  const renderCollab = () => {
    return (
      <Grid item container direction='column'>
        <Grid item container direction='row' justify='center' alignItems='center' spacing={3} className={classes.title}>
          <Grid item>{related}</Grid>
          <Grid item>
            <Chip key='collab' label='collaborated with' />
          </Grid>
          <Grid item>{artist}</Grid>
        </Grid>
        { data.map((c) => renderContent(c.content)) }
      </Grid>
    )
  }

  if (data) {
    return (
      <Grid container className={classes.root}>
        <Header message={'go to map'} link={'/'}/>
        { type === 'collab' ? renderCollab() :
            type === 'ref' ? renderRef() : renderCover() }
      </Grid>
    )
  } else {
    return <CircularProgress />
  }
}

export default ConnPage

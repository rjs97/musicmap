import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { useParams, useHistory } from 'react-router-dom'
import Button from '@material-ui/core/Button'
import Chip from '@material-ui/core/Chip'
import Grid from '@material-ui/core/Grid'
import CircularProgress from '@material-ui/core/CircularProgress'
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft'
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight'
import Link from '@material-ui/core/Link'
import MobileStepper from '@material-ui/core/MobileStepper'
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

const RelPage = () => {
  const classes = useStyles()
  const [data, setData] = useState(null)
  const [activeStep, setActiveStep] = useState(0)
  const [totalSteps, setTotal] = useState(0)
  const [artist, setArtist] = useState('')
  const [related, setRelated] = useState('')

  const { linkid } = useParams()
  const history = useHistory()

  useEffect(() => {
    axios.get(`https://us-central1-cotton-eyed-joe.cloudfunctions.net/widgets/relationships?linkId=${linkid}`).then(res => {
      const pages = (!!res.data.collab.length) + res.data.cover.length + res.data.ref.length
      setArtist(res.data.artist)
      setRelated(res.data.related)
      setTotal(pages)
      setData(res.data)
    })
    setActiveStep(0)
  }, [linkid])

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  const renderCover = (i) => {
    if (!data.cover.length) return
    return (
      <Grid item container direction='column' alignItems='center' justify='center'>
      <Grid item container direction='row' justify='center' alignItems='center' spacing={3} className={classes.title}>
        <Grid item>{related}</Grid>
        <Grid item>
          <Chip onClick={() => history.push(`/conn/${linkid}/cover/${data.cover[i]._id}`)} key={data.cover[i].type} label={MUSIC_RELATIONSHIPS[data.cover[i].type]} />
        </Grid>
        <Grid item>{artist}</Grid>
      </Grid>
      <Grid item container direction='row' justify='center' alignItems='center' className={classes.rel}>
        <Grid container item direction='column' xs={6} alignItems='center'>
          <Grid item>
          { YOUTUBE_REGEX.test(data.cover[i].track.src) ?
            <iframe
              src={`https://www.youtube.com/embed/${data.cover[i].track.id}`}
              width="80"
              height="80"
              title={data.cover[i].track.name}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            />
            : <iframe
            src={`https://open.spotify.com/embed/track/${data.cover[i].track.id}`}
            width="80"
            height="80"
            title={data.cover[i].track.name}
            frameBorder="0"
            allowtransparency="true"
            allow="encrypted-media"
          />}</Grid>
          <Grid item>{data.cover[i].track.name}</Grid>
        </Grid>
        <Grid container item direction='column' xs={6} alignItems='center'>
          <Grid item><iframe
            src={`https://open.spotify.com/embed/track/${data.cover[i].origTrack.id}`}
            width="80"
            height="80"
            title={data.cover[i].origTrack.name}
            frameBorder="0"
            allowtransparency="true"
            allow="encrypted-media"
          /></Grid>
          <Grid item>{data.cover[i].origTrack.name}</Grid>
        </Grid>
      </Grid>
      </Grid>
    )
  }

  const renderRef = (i) => {
    if (!data.ref.length) return
    return (
      <Grid item container direction='column'>
      <Grid item container direction='row' justify='center' alignItems='center' spacing={3} className={classes.title}>
        <Grid item>{related}</Grid>
        <Grid item>
          <Chip onClick={() => history.push(`/conn/${linkid}/ref/${data.ref[i]._id}`)} key={data.ref[i].type} label={MUSIC_RELATIONSHIPS[data.ref[i].type]} />
        </Grid>
        <Grid item>{artist}</Grid>
      </Grid>
      {data.ref[i].content ? renderContent(data.ref[i].content) : null }
      {data.ref[i].quote ?
        <Grid item className={classes.quote}>"{data.ref[i].quote}"</Grid>
        : YOUTUBE_REGEX.test(data.ref[i].url) ? <iframe
          src={`https://www.youtube.com/embed/${data.ref[i].id}`}
          width="80"
          height="80"
          title={data.ref[i].title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        />
        : null
      }
      <Grid item container direction='row' justify='flex-end'>
        <Link href={data.ref[i].url} target="_blank" className={classes.src} color="inherit">
          {data.ref[i].title}
        </Link>
      </Grid>
    </Grid>
    )
  }

  const renderCollab = () => {
    if (!data.collab.length) return
    return (
      <Grid item container direction='column'>
        <Grid item container direction='row' justify='center' alignItems='center' spacing={3} className={classes.title}>
          <Grid item>{related}</Grid>
          <Grid item>
            <Chip onClick={() => history.push(`/conn/${linkid}/collab/0`)} key='collab' label='collaborated with' />
          </Grid>
          <Grid item>{artist}</Grid>
        </Grid>
        { data.collab.map((c) => renderContent(c.content)) }
      </Grid>
    )
  }

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

  return (
    <Grid container className={classes.root}>
      <Header message={'go to map'} link={'/'}/>
      { data ?
        <Grid container alignItems='center' justify='center' spacing={3} direction='column'>
          <Grid item>
            <MobileStepper
              steps={totalSteps}
              position='static'
              variant='text'
              activeStep={activeStep}
              nextButton={
                <Button onClick={handleNext} disabled={activeStep === (totalSteps - 1)}>
                  <KeyboardArrowRight />
                </Button>
              }
              backButton={
                <Button onClick={handleBack} disabled={activeStep === 0}>
                  <KeyboardArrowLeft />
                </Button>
              }
            />
          </Grid>
          { ((activeStep - !!data.collab.length - data.cover.length) < 0) ?
              ((activeStep - !!data.collab.length) < 0) ?
                (!!data.collab.length ? renderCollab() : null)
                : renderCover(activeStep - !!data.collab.length) : renderRef(activeStep - !!data.collab.length - data.cover.length) }
        </Grid>
        : <CircularProgress /> }
    </Grid>
  )
}

export default RelPage

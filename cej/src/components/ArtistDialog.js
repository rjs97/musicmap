import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Chip from '@material-ui/core/Chip'
import DialogContent from '@material-ui/core/DialogContent'
import Grid from '@material-ui/core/Grid'
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import Link from '@material-ui/core/Link'
import MobileStepper from '@material-ui/core/MobileStepper';

const useStyles = makeStyles((theme) => ({
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
  'sample': 'sampled from',
  'sampled': 'was sampled by',
  'interpolation': 'was interpolated by',
  'interpolated': 'interpolated'
}

const COVER_RELATIONSHIPS = ['cover', 'covered', 'sample', 'sampled', 'interpolation', 'interpolated']

const ArtistDialog = ({ artist, related, rel }) => {
  const classes = useStyles()
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    setActiveStep(0)
  }, [rel])

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  return (
    <DialogContent>
      <Grid container alignItems='center' justify='center' direction='column' spacing={3}>
        <Grid item>
          <MobileStepper
            steps={rel.length}
            position='static'
            variant='text'
            activeStep={activeStep}
            className={classes.stepper}
            nextButton={
              <Button onClick={handleNext} disabled={activeStep === (rel.length - 1)}>
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
        <Grid item container direction='row' justify='center' alignItems='center' spacing={2} className={classes.title}>
          <Grid item container xs={4} justify='flex-end'>{related}</Grid>
          <Grid item container xs={4} justify='center'>
            <Chip key={rel[activeStep].name} label={MUSIC_RELATIONSHIPS[rel[activeStep].name]} />
          </Grid>
          <Grid item container xs={4} justify='flex-start'>{artist}</Grid>
        </Grid>
        {COVER_RELATIONSHIPS.includes(rel[activeStep].name) ?
          !(rel[activeStep].name.includes('cover')) ?
          <Grid item container direction='row' justify='center' alignItems='center' className={classes.rel}>
            <Grid container item direction='column' xs={6} alignItems='center'>
              <Grid item><iframe
                src={`https://open.spotify.com/embed/track/${rel[activeStep].track.spotifyId}`}
                width="80"
                height="80"
                title={rel[activeStep].track.name}
                frameBorder="0"
                allowtransparency="true"
                allow="encrypted-media"
              /></Grid>
              <Grid item>{rel[activeStep].track.name}</Grid>
            </Grid>
            <Grid container item direction='column' xs={6} alignItems='center'>
              <Grid item><iframe
                src={`https://open.spotify.com/embed/track/${rel[activeStep].origin_track.spotifyId}`}
                width="80"
                height="80"
                title={rel[activeStep].origin_track.name}
                frameBorder="0"
                allowtransparency="true"
                allow="encrypted-media"
              /></Grid>
              <Grid item>{rel[activeStep].origin_track.name}</Grid>
            </Grid>
          </Grid> :
          <Grid container direction='column' alignItems='center'>
          <Grid item>{rel[activeStep].origin_track.name}</Grid>
          <Grid item container direction='row' justify='center' alignItems='center' className={classes.rel} spacing={3}>
            <Grid item>
              <iframe
                src={`https://open.spotify.com/embed/track/${rel[activeStep].track.spotifyId}`}
                width="80"
                height="80"
                title={rel[activeStep].track.name}
                frameBorder="0"
                allowtransparency="true"
                allow="encrypted-media"
              />
            </Grid>
            <Grid item>
              <iframe
                src={`https://open.spotify.com/embed/track/${rel[activeStep].origin_track.spotifyId}`}
                width="80"
                height="80"
                title={rel[activeStep].origin_track.name}
                frameBorder="0"
                allowtransparency="true"
                allow="encrypted-media"
              />
            </Grid>
          </Grid>
          </Grid> :
          (rel[activeStep].track) ?
          <Grid item container direction='row' justify='center' alignItems='center' className={classes.rel} spacing={3}>
            <Grid item>
              <iframe
                src={`https://open.spotify.com/embed/track/${rel[activeStep].track.spotifyId}`}
                width="80"
                height="80"
                title={rel[activeStep].track.name}
                frameBorder="0"
                allowtransparency="true"
                allow="encrypted-media"
              />
            </Grid>
            <Grid item>{rel[activeStep].track.name}</Grid> {/* TODO: add album after you update extension */}
          </Grid>
           : null
        }
        {rel[activeStep].ref ?
          <Grid item container>
            {rel[activeStep].ref.quote ?
              <Grid item className={classes.quote}>"{rel[activeStep].ref.quote}"</Grid>
              : null
            }
            <Grid item container direction='row' justify='flex-end'>
              <Link href={rel[activeStep].ref.url} target="_blank" className={classes.src} color="inherit">
                {rel[activeStep].ref.title}
              </Link>
            </Grid>
          </Grid>
          : null
        }
      </Grid>
    </DialogContent>
  )
}

export default ArtistDialog

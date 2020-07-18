import React, { useState } from 'react'
import GridListTile from '@material-ui/core/GridListTile';
import MobileStepper from '@material-ui/core/MobileStepper';
import { makeStyles, useTheme } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import Typography from '@material-ui/core/Typography'
import GridList from '@material-ui/core/GridList'

const useStyles = makeStyles({
  heading: {
    fontSize: 13,
    flexBasis: '75%',
    flexShrink: 0,
    overflow: 'auto',
  },
  stepper: {
    maxWidth: 400,
    flexGrow: 1,
    maxHeight: 10
  },
  card: {
    width: '100%'
  }
});

const ContentStepper = ({ rel }) => {
  const classes = useStyles()
  const [activeStep, setActiveStep] = useState(0)
  const theme = useTheme()

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  return (
    <GridList cellHeight={100} cols={1}>
    {
      activeStep > rel.length ? setActiveStep(0) :
      <div>
      <GridListTile key={`${rel[activeStep]._id}-content`}>
        <Typography component={'span'} className={classes.heading}>
          <b>{rel[activeStep].name.toUpperCase()}</b>
          {rel[activeStep].track ?
            <iframe
              src={`https://open.spotify.com/embed/track/${rel[activeStep].track.spotifyId}`}
              width="100%"
              height="75"
              title={rel[activeStep].track.name}
              frameBorder="0"
              allowtransparency="true"
              allow="encrypted-media"
            /> : ''
          }
          {rel[activeStep].ref ? <p><a href={rel[activeStep].ref}>{rel[activeStep].ref}</a></p> : null}
        </Typography>
        </GridListTile>
        <GridListTile key={`${rel[activeStep]._id}-nav`}>
          <MobileStepper
            steps={rel.length}
            position='static'
            variant='dots'
            activeStep={activeStep}
            className={classes.stepper}
            nextButton={
              <Button size="small" onClick={handleNext} disabled={activeStep === (rel.length - 1)}>
              Next
              {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
              </Button>
            }
            backButton={
              <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
                {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
                Back
              </Button>
            }
          />
        </GridListTile>
        </div>
      }
    </GridList>
  )
}

export default ContentStepper

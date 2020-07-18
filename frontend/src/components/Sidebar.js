import React, { useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import Typography from '@material-ui/core/Typography'
import GridList from '@material-ui/core/GridList'
import ContentStepper from './ContentStepper'

const useStyles = makeStyles({
  card: {
    minWidth: 300,
    minHeight: '100%',
    maxHeight: '75vh',
    overflow: 'scroll',
    backgroundColor: 'powderblue',
  },
  title: {
    fontSize: 15,
  },
  heading: {
    fontSize: 13,
    flexBasis: '75%',
    flexShrink: 0,
  },
  accordion: {
    minHeight: 150,
    overflow: 'hidden'
  }
});

const Sidebar = ({ name, url, links }) => {
  const classes = useStyles()
  const [expanded, setExpanded] = React.useState('panel0')

  useEffect(() => {
    setExpanded('panel0')
  }, [links])

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  }

  if (name === null || url === null) {
    return <p>Click on an artist to start</p>
  }

  return (
    <Card className={classes.card}>
      <CardContent>
        <Typography className={classes.title}>
          {name}
        </Typography>
      </CardContent>
      <CardContent>
        <Accordion expanded={expanded === 'panel0'} onChange={handleChange('panel0')}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`panel0bh-content`}
            id={`panel0bh-header`}
          >
            <Typography className={classes.heading}>Listen</Typography>
          </AccordionSummary>
          <AccordionDetails>
          <GridList cols={1}>
            <iframe src={`https://open.spotify.com/embed/artist/${url}`} width="225" height="200" title={name} frameBorder="0" allowtransparency="true" allow="encrypted-media" />
          </GridList>
          </AccordionDetails>
        </Accordion>
      </CardContent>
      <CardContent>
        { links ?
          links.map((link, i) => {
            return (
              <Accordion expanded={expanded === `panel${i+1}`} onChange={handleChange(`panel${i+1}`)} key={`connection${i+1}`}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel${i+1}bh-content`}
                id={`panel${i+1}bh-header`}
              >
                <Typography className={classes.heading}>{link.target === name ? link.source : link.target}</Typography>
              </AccordionSummary>
              <AccordionDetails className={classes.accordion}>
                <ContentStepper rel={link.relationship}/>
              </AccordionDetails>
              </Accordion>
            )
          }) : null
        }
      </CardContent>
    </Card>
  )
}

export default Sidebar

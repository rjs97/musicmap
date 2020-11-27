import React from 'react'
import Header from '../components/Header'
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Link from '@material-ui/core/Link'

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    width: '80%',
  },
  title: {
    fontSize: 22,
    paddingBottom: 30
  },
  header: {
    fontSize: 18,
    paddingBottom: 10
  },
  content: {
    textAlign: 'left',
    fontSize: 14,
    paddingBottom: 10
  }
}))

const Info = () => {
  const classes = useStyles()

  return (
     <div className={classes.root}>
      <Header message={'back to map'} link={'/map'}/>
      <Grid item container direction='column' justify='center'>
      <Grid item className={classes.title}>
        FAQ
      </Grid>
      <Grid item className={classes.header}>
        i dont get it
      </Grid>
      <Grid item className={classes.content}>
        It's a map of relationships between musicians. Sources include stated influences, cited from interviews,
        references (mentions of other artists in song lyrics, for example), collaborations,
        covers, samples, and interpolations (the re-recording of a previous melody or song, even
        with slight variations).
      </Grid>
      <Grid item className={classes.header}>
        why are you spending your time on this
      </Grid>
      <Grid item className={classes.content}>
        Inspired by the research from my college radio show, I decided to create
        a map of musical influences. Whenever I see interviews, I think it's really
        sweet how much artists draw inspiration from one another, and I wanted
        a way to easily record those relationships. For example, here's a nice quote from a
        Phoebe Bridgers interview with Sirius XM about her collaborations with
        other artists, which are numerous (Monday Mixtape, November 9, 2020): <br/>
        <Grid item style={{ marginLeft: '5%', fontSize: 12, fontStyle: 'italic', paddingTop: 10 }}>"How beautiful is it that I found Julien, and I found Lucy and I found Conor Oberst,
        and Matt Berninger, and all these people, where the way that we connect is putting out our
        darkest stuff"</Grid>
      </Grid>
      <Grid item className={classes.header}>
        i know about a connection not on this map
      </Grid>
      <Grid item className={classes.content}>
        If you would like to add a connection to the map, you can click
        on the "Add Connection" button and walk through the steps there. If you, like me, enjoy
        reading artist interviews and finding out who they draw influence from, you can
        quoted influence connections by downloading and using the extension <Link href='/info'>here</Link> (link will
        become active once published on the Chrome store). From the extension, you can also add
        YouTube covers to the map.
      </Grid>
      </Grid>
    </div>
  );
}

export default Info

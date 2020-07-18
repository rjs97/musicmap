import React from 'react';
import GraphData from '../components/GraphData'
import NavButton from '../components/NavButton'
import { makeStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'

const useStyles = makeStyles({
  root: {
    height: 150,
  },
  content: {
    display: 'flex',
  }
})

const Home = () => {
  const classes = useStyles()
  return (
    <Container maxWidth="lg">
    <div className={classes.root}>
      <NavButton message={'suggest'} />
    </div>
    <main className={classes.content}>
      <GraphData />
    </main>
    </Container>
  );
}

export default Home

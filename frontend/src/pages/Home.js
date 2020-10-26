import React from 'react';
import GraphData from '../components/GraphData'
import Header from '../components/Header'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    width: '100%'
  },
  content: {
    offset: theme.mixins.toolbar
  }
}))

const Home = () => {
  const classes = useStyles()
  return (
    <div className={classes.root}>
      <Header message={'suggest'} />
    <main className={classes.content}>
      <GraphData />
    </main>
    </div>

  );
}

export default Home

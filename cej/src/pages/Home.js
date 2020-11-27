import React, { useState, useEffect } from 'react'
import GraphData from '../components/GraphData'
import Header from '../components/Header'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Grid from '@material-ui/core/Grid'
import MobileDialog from '../components/MobileDialog'

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    width: '80%'
  },
  content: {
    marginTop: 30
  }
}))

const Home = () => {
  const classes = useStyles()
  const theme = useTheme()
  const mobile = useMediaQuery(theme.breakpoints.down('sm'))

  const [open, setOpen] = useState(mobile)

  useEffect(() => {
    setOpen(mobile)
  }, [mobile])

  return (
    <div className={classes.root}>
      <Header message={'add a connection'} link={'/add'}/>
      <Grid container className={classes.content} alignItems='center' justify='center'>
        { mobile ? <MobileDialog setOpen={setOpen} open={open} /> : <GraphData />}
      </Grid>
    </div>

  );
}

export default Home

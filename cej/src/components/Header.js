import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Link from '@material-ui/core/Link'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import SearchIcon from '@material-ui/icons/Search'
import InputAdornment from '@material-ui/core/InputAdornment'
import Button from '@material-ui/core/Button'

const useStyles = makeStyles((theme) => ({
  title: {
    color: '#696969',
    fontSize: 27,
    marginBottom: 10
  },
  subtitle: {
    color: 'darkolivegreen',
    fontSize: 16,
    marginTop: 5
  },
  search: {
    position: 'fixed',
    right: 20,
    top: 20
  },
  button: {
    position: 'fixed',
    left: 20,
    top: 20
  }
}))

export default function Header () {
  const classes = useStyles()

  return (
    <Grid container direction='row'>
      <Grid item>
      <Link href={'/add'}>
        <Button
          id="connection-button"
          className={classes.button}
        >add a connection</Button>
      </Link>
      </Grid>
      <Grid item container direction='column' style={{ textAlign: 'center', marginBottom: 20, marginTop: 20 }}>
        <Link href={'/'} className={classes.title} color='primary'>cotton eyed joe</Link>
        <p className={classes.subtitle}>where did you come from where did you go</p>
      </Grid>
      <Grid item>
        <TextField
          id="search-bar"
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: <InputAdornment position='start'><SearchIcon/></InputAdornment>,
          }}
          className={classes.search}
        />
      </Grid>
      {/* TODO: add mobile menu */}
    </Grid>
  )
}

import React, { useState } from 'react'
import { useTheme, makeStyles } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Link from '@material-ui/core/Link'
import Paper from '@material-ui/core/Paper'
import { useLocation } from 'react-router-dom'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'
import Grid from '@material-ui/core/Grid'
import Dialog from '@material-ui/core/Dialog'
import TextField from '@material-ui/core/TextField'
import SearchIcon from '@material-ui/icons/Search'
import InputAdornment from '@material-ui/core/InputAdornment'

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
  nav: {
    fontSize: 18,
    padding: 8
  },
  avatar: {
    width: theme.spacing(3),
    height: theme.spacing(3)
  },
  menuIcon: {
    position: 'fixed',
    top: 20,
    right: 20,
  },
  menu: {
    position: 'fixed',
    right: 20,
    top: '5%',
    color: '#696969',
    backgroundColor: '#edfff8'
  },
  dialog: {
    margin: 20,
  },
  search: {
    position: 'fixed',
    right: 20,
    top: 20
  }
}))

export default function Header () {
  const classes = useStyles()
  const path = useLocation()
  const theme = useTheme()
  const mobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [open, setOpen] = useState(false)

  const handleOpen = () => {
    setOpen(!open)
  }

  return (
    <Grid container direction='row'>
      <Grid item container direction='column' style={{ textAlign: 'center', marginBottom: 20, marginTop: 20 }}>
        <Link href={'/'} className={classes.title} color='primary'>cotton eyed joe</Link>
        <p className={classes.subtitle}>where did you come from where did you go</p>
      </Grid>
      <Grid item>
        <TextField
          id="outlined-size-small"
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: <InputAdornment position='start'><IconButton edge='start'><SearchIcon/></IconButton></InputAdornment>,
          }}
          className={classes.search}
        />
      </Grid>
    </Grid>
  )
}

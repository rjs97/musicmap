import React, { useState } from 'react'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import { useLocation } from 'react-router-dom'
import Link from '@material-ui/core/Link'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import SearchIcon from '@material-ui/icons/Search'
import InputAdornment from '@material-ui/core/InputAdornment'
import Button from '@material-ui/core/Button'
import WIPDialog from './WIPDialog'

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

export default function Header ({ message, link }) {
  const classes = useStyles()
  const theme = useTheme()
  const mobile = useMediaQuery(theme.breakpoints.down('sm'))
  const path = useLocation()
  const [open, setOpen] = useState(false)

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setOpen(true)
    }
  }

  return (
    <Grid container direction='row'>
      <Grid item>
      <Link href={link}>
        <Button
          id="connection-button"
          className={classes.button}
        >{message}</Button>
      </Link>
      </Grid>
      <Grid item container direction='column' style={{ textAlign: 'center', marginBottom: 20, marginTop: 20 }}>
        <Link href={'/'} className={classes.title} color='primary'>cotton eyed joe</Link>
        <p className={classes.subtitle}>where did you come from where did you go</p>
      </Grid>
      {(mobile || path.pathname === '/add') ? null : <Grid item>
        <TextField
          id="search-bar"
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: <InputAdornment position='start'><SearchIcon/></InputAdornment>,
          }}
          className={classes.search}
          onKeyDown={handleSearch}
        />
        <WIPDialog setOpen={setOpen} open={open} />
      </Grid>}
    </Grid>
  )
}

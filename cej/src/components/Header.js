import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { useLocation } from 'react-router-dom'
import Link from '@material-ui/core/Link'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import HelpOutlineIcon from '@material-ui/icons/HelpOutline'
import SearchIcon from '@material-ui/icons/Search'
import InputAdornment from '@material-ui/core/InputAdornment'
import Button from '@material-ui/core/Button'
import WIPDialog from './WIPDialog'
import IconButton from '@material-ui/core/IconButton'

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
}))

export default function Header ({ message, link }) {
  const classes = useStyles()
  const path = useLocation()
  const [open, setOpen] = useState(false)

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setOpen(true)
    }
  }

  return (
    <Grid container direction='row' alignItems='center' justify='center'>
      <Grid item container xs={4} spacing={3} alignItems='center' justify='flex-start'>
        <Link href={link}>
          <Button
            id="link-button"
            className={classes.button}
          >{message}</Button>
        </Link>
      </Grid>
      <Grid item container xs={4} direction='column' style={{ marginTop: 20 }}>
        <Link href={'/'} className={classes.title} color='primary'>cotton eyed joe</Link>
        <p className={classes.subtitle}>where did you come from where did you go</p>
      </Grid>
      {(path.pathname === '/' || path.pathname === '/map') ?
      <Grid item container xs={4} spacing={3} alignItems='center' justify='flex-end'>
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
      <Grid item>
        <Link href={'/info'}><IconButton><HelpOutlineIcon /></IconButton></Link>
      </Grid>
      </Grid>
       :
       <Grid item container xs={4} justify='flex-end'>
         <Link href={'/info'}><IconButton><HelpOutlineIcon /></IconButton></Link>
       </Grid>
      }
    </Grid>
  )
}

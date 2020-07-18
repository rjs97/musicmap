import React from 'react'
import { Link } from 'react-router-dom'

import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'

const NavButton = ({ message }) => {
  return (
    <Grid container
      direction='row'
      justify='space-around'
      alignItems='center'
      spacing={0}
      >
      <Grid item xs={3}>
        <Link to={`/${message}`}>
          <Button variant="contained">
            { message.toUpperCase() }
          </Button>
        </Link>
      </Grid>
      <Grid item xs={6}>
        <h1 style={{ color: 'white' }}>MusicMap</h1>
      </Grid>
      <Grid item xs={3}>
      </Grid>
    </Grid>
  )
}

export default NavButton

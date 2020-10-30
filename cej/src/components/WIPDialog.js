import React, { useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import Grid from '@material-ui/core/Grid'

const useStyles = makeStyles(() => ({
  title: {
    fontFamily: 'ubuntu',
    color: 'black',
    fontSize: 18,
    paddingBottom: 10
  },
  content: {
    fontFamily: 'ubuntu',
    color: 'red',
    fontSize: 13,
    paddingBottom: 10
  },
}))

const WIPDialog = ({ open, setOpen }) => {
  const classes = useStyles()

  useEffect(() => {
    setOpen(open)
  })

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <Dialog
        open={open}
        onClose={handleClose}
        scroll='body'
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
    <DialogContent>
      <Grid container direction='column' alignItems='center'>
        <Grid item className={classes.title}>look, building a website is hard</Grid>
        <Grid item className={classes.content}>
        and sometimes it takes longer than i thought to get certain parts of it
        to work. but it would be rude to leave you hanging so i'm letting you know that
        this part doesn't work yet. it will eventually.
        </Grid>
      </Grid>
    </DialogContent>
    </Dialog>
  )
}

export default WIPDialog

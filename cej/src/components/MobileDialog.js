import React from 'react'
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
    color: 'purple',
    fontSize: 13,
    paddingBottom: 10
  },
}))

const MobileDialog = ({ open, setOpen }) => {
  const classes = useStyles()

  return (
    <Dialog
        open={open}
        scroll='body'
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
    <DialogContent>
      <Grid container direction='column' alignItems='center'>
        <Grid item className={classes.title}>seems like you're on a mobile device</Grid>
        <Grid item className={classes.content}>
        this website doesn't look very good yet on small screens. rather than
        subject you to that, i am going to firmly suggest that you get on a
        computer browser and check out this very fun website. (at some point
        i will make this mobile friendly, but now simply is not that time.)
        </Grid>
      </Grid>
    </DialogContent>
    </Dialog>
  )
}

export default MobileDialog

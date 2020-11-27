import React, { useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import Dialog from '@material-ui/core/Dialog'
import GridList from '@material-ui/core/GridList'
import GridListTile from '@material-ui/core/GridListTile'
import GridListTileBar from '@material-ui/core/GridListTileBar'
import ArtistDialog from './ArtistDialog'

const useStyles = makeStyles({
  card: {
    margin: 10,
    minHeight: '100%',
    maxHeight: '75vh',
    overflow: 'scroll',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 20,
  },
  accordion: {
    minHeight: 150,
    overflow: 'hidden'
  },
  titleBar: {
    background:
      'linear-gradient(to top, rgba(0,0,0,0.7) 0%, ' +
      'rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
    fontFamily: 'ubuntu',
    fontSize: 8
  },
  gridList: {
    cursor: 'pointer'
  }
});

const Sidebar = ({ name, url, links }) => {
  const classes = useStyles()
  const [open, setOpen] = useState(false)
  const [dialog, setDialog] = useState('')

  const findId = (link) => {
    if (!links) return
    const find = links.find((e) => {
      return (e.target.toLowerCase() === link.toLowerCase())
    })
    if (!find) return
    return find._id
  }

  const handleOpen = (e) => {
    setDialog(e.target.alt || e.target.innerText)
    setOpen(true)
  }

  const handleClose = () => {
    setDialog('')
    setOpen(false)
  }

  useEffect(() => {}, [links]) // TODO: update loading (sometimes artists are in sidebar for too long)

  if (name === null || url === null) {
    return <p style={{ paddingRight: '10vw' }}>click on an artist to start</p>
  }

  return (
    <Card className={classes.card} square elevation={1}>
      <h5 className={classes.title}>{name}</h5>
      <GridList cellHeight={75} spacing={1} cols={(links && (links.length > 1)) ? 2 : 1} className={classes.gridList}>
      { links ?
        links.map((link, i) => (
            <GridListTile key={link.targetImg} onClick={handleOpen}>
              <img src={link.targetImg} alt={link.target}/>
              <GridListTileBar
                title={link.target}
                titlePosition='bottom'
                className={classes.titleBar}
              />
            </GridListTile>
          )) : null
      }
      </GridList>
      <Dialog
          open={open}
          onClose={handleClose}
          scroll='body'
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
        {dialog ? <ArtistDialog artist={name} related={dialog} id={findId(dialog)} /> : null}
      </Dialog>
    </Card>
  )
}

export default Sidebar

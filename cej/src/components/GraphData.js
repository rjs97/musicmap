import React, { useState, useEffect } from 'react'
import Grid from '@material-ui/core/Grid'
import Graph from './Graph'
import axios from 'axios'

const GraphData = () => {
  const [links, setLinks] = useState(null)
  const [nodes, setNodes] = useState(null)

  useEffect(() => {
    let active = true
    axios.get('https://us-central1-cotton-eyed-joe.cloudfunctions.net/widgets/link').then(res => {
      if (active) { setLinks(res.data) }
    })
    axios.get('https://us-central1-cotton-eyed-joe.cloudfunctions.net/widgets/node').then(res => {
      if (active) { setNodes(res.data) }
    })
    return () => (active = false)
  }, [])

  if (links === null || nodes === null) {
    return <Grid container direction='column' alignItems='center' justify='center'>Loading...</Grid>
  }

  return (
    <Graph nodes={nodes} links={links} />
  )

}

export default GraphData

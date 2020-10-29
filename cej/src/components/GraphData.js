import React, { useState, useEffect } from 'react'
import Graph from './Graph'
import axios from 'axios'

const GraphData = () => {
  const [links, setLinks] = useState(null)
  const [nodes, setNodes] = useState(null)

  useEffect(() => {
    axios.get('https://us-central1-cotton-eyed-joe.cloudfunctions.net/widgets/link').then(res => {
      setLinks(res.data)
    })
    axios.get('https://us-central1-cotton-eyed-joe.cloudfunctions.net/widgets/node').then(res => {
      setNodes(res.data)
    })
  }, [])

  if (links === null || nodes === null) {
    return <p>Loading...</p>
  }

  return (
    <Graph nodes={nodes} links={links} />
  )

}

export default GraphData

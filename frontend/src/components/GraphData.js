import React, { useState, useEffect } from 'react'
import Graph from './Graph'
import axios from 'axios'

const GraphData = () => {
  const [links, setLinks] = useState(null)
  const [nodes, setNodes] = useState(null)

  useEffect(() => {
    axios.get('http://localhost:8888/link').then(res => {
      setLinks(res.data)
    })
    axios.get('http://localhost:8888/node').then(res => {
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

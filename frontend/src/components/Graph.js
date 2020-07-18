import React, { useEffect, useRef } from 'react'
import { select } from 'd3-selection'
import { forceSimulation, forceLink, forceManyBody, forceX, forceY, forceCollide } from 'd3-force'
import Sidebar from './Sidebar'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'

import axios from 'axios'

function getSpotifyId (url) {
  return url.substring(url.lastIndexOf('/') + 1)
}

const Graph = ({ nodes, links }) => {
  const d3svg = useRef(null)
  const [name, setName] = React.useState(null)
  const [url, setUrl] = React.useState(null)
  const [data, setData] = React.useState(null)

  useEffect(() => {
    if (nodes && d3svg.current) {
      let svg = select(d3svg.current)
      svg.selectAll('*').remove()

      const width = svg.node().clientWidth
      const height = svg.node().clientHeight

      svg = svg.append('g')

      const simulation = forceSimulation(nodes)
        .force('link', forceLink(links).distance(100).id(d => d.name))
        .force('charge', forceManyBody())
        .force('x', forceX(width / 2))
        .force('y', forceY(height / 2))
        .force('collision', forceCollide().radius(30))
        .stop()

      simulation.tick(300)
      const link = svg.append('g')
          .attr('stroke', '#999')
          .attr('stroke-opacity', 0.6)
        .selectAll('.link')
        .remove()
        .data(links)
        .join('line')
          .attr('class', 'link')
          .attr('stroke-width', d => Math.sqrt(d.relationship.length))
          .attr('stroke', 'white')
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y)
        .on('click', d => console.log(d))

      link.append('title')
        .text(d => d.relationship.name)

      const groups = svg.append('g')
        .selectAll('.node')
        .data(nodes)
        .enter().append('g')
        .attr('class', 'node')
        .attr('fx', d => d.x)
        .attr('fy', d => d.y)
        .on('click', d => {
          axios.get(`http://localhost:8888/connections?name=${d.name}`).then(res => {
            setData(res.data)
          })
          setName(d.name)
          svg.selectAll('.link').attr('stroke', e => (e.source.name === d.name || e.target.name === d.name) ? 'yellow' : 'white')
          setUrl(getSpotifyId(d.spotifyUrl))
         })

      groups.append('image')
        .attr('class', 'circle')
        .attr('xlink:href', d => d.imageUrl)
        .attr('width', 30)
        .attr('height', 30)
        .attr('x', d => d.x)
        .attr('y', d => d.y)

      groups.append('title')
        .text(d => d.name)

    }
  }, [links, nodes])

  return (
    <Grid container
      direction='row'
      justify='space-around'
      alignItems='center'
      spacing={5}>
      <Grid item xs={9}>
        <Paper style={{ backgroundColor: 'thistle', height: '75vh' }}>
          <svg
            className="graph-container"
            width={'100%'}
            height={'70vh'}
            role="img"
            ref={d3svg}
          />
        </Paper>
      </Grid>
      <Grid item xs={3}>
        <Sidebar name={name} url={url} links={data}/>
      </Grid>
    </Grid>
  )
}

export default Graph

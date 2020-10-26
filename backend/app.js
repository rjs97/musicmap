const express = require('express')
const { check, validationResult } = require('express-validator')
const cors = require('cors')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const path = require('path')
var axios = require('axios')

// EXPRESS CODE
var app = express()
const port = 8888
app.use(express.static(path.join(__dirname, '/public')))
  .use(cors())
  .use(bodyParser.urlencoded({ extended: true }))
  .use(bodyParser.json())

app.set('view engine', 'html')

// DATABASE CODE
mongoose.connect('<insert connection string>', { useNewUrlParser: true, useUnifiedTopology: true })
var Schema = mongoose.Schema
var linkSchema = new Schema({
  source: String,
  target: String,
  targetImg: String,
  relationship: [{
    name: String,
    track: {
      name: String,
      spotifyId: String,
      album: String
    },
    ref: {
      quote: String,
      title: String,
      url: String
    },
    _id: false
  }]
})

var nodeSchema = new Schema({
  name: String,
  spotifyUrl: String,
  imageUrl: String
})

var clippedSchema = new Schema({
  quote: String,
  pageUrl: String,
  pageTitle: String,
  tag: String
})

const Link = mongoose.model('Link', linkSchema, 'link')
const Node = mongoose.model('Node', nodeSchema, 'node')
const Clipped = mongoose.model('Clipped', clippedSchema, 'clipped')

// SPOTIFY CODE
const clientId = '<insert client id>'
const clientSecret = '<insert client secret>'

// TODO: export spotify functions to its own file
async function accessSpotify () {
  try {
    const response = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      headers: {
        Authorization: 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      params: {
        grant_type: 'client_credentials'
      },
      responseType: 'json'
    })

    if (response.status === 200) {
      return response.data.access_token
    }
  } catch (err) {
    console.error('spotify auth error: ', err)
  }
}

async function searchArtist (artist) {
  try {
    const token = await accessSpotify()
    const response = await axios({
      method: 'get',
      url: 'https://api.spotify.com/v1/search',
      headers: {
        Authorization: 'Bearer ' + token
      },
      params: {
        q: artist,
        type: 'artist',
        limit: 1
      }
    })

    const result = response.data.artists.items.find((item) => {
      const clean = item.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      return (clean.toLowerCase() === artist.toLowerCase())
    })

    if (result) {
      console.log('returning ', result.name)
      Node.findOneAndUpdate({ name: result.name }, {
        name: result.name,
        spotifyUrl: result.external_urls.spotify,
        imageUrl: result.images[0].url
      }, { upsert: true, new: true, useFindAndModify: false }).exec()
      return result.name
    } else {
      return 404
    }
  } catch (err) {
    console.error('spotify artist search error: ', err)
  }
}

async function searchSong (song) {
  try {
    const token = await accessSpotify()
    const response = await axios({
      method: 'get',
      url: 'https://api.spotify.com/v1/search',
      headers: {
        Authorization: 'Bearer ' + token
      },
      params: {
        q: song,
        type: 'track',
        limit: 5
      }
    })

    if (response.data.tracks.length === 0) return

    const result = response.data.tracks.items

    let i = 0
    const ret = result.map((res) => {
      i++
      const artists = res.artists.map((a) => a.name)
      return {
        _id: i,
        albumUrl: res.album.images[0].url,
        songTitle: res.name,
        artists: artists,
        spotifyId: res.id
      }
    })

    return ret
  } catch (err) {
    console.error('spotify song search error: ', err)
  }
}

// const songItem = result.find(item => {
//   return item.name.toLowerCase().replace(/[“”‘’''""]/g, '').startsWith(song.toLowerCase())
// })
//
// if (songItem) {
//   const artistInfo = await Promise.all(songItem.artists.map(async (artist) => {
//     const res = await axios({
//       method: 'get',
//       url: artist.href,
//       headers: {
//         Authorization: 'Bearer ' + token
//       }
//     })
//     return res.data
//   }))
//
//   artistInfo.forEach(async (artist) => {
//     await Node.findOneAndUpdate({ name: artist.name }, {
//       name: artist.name,
//       spotifyUrl: artist.external_urls.spotify,
//       imageUrl: artist.images[0].url
//     }, { upsert: true, useFindAndModify: false }).exec()
//     artistInfo.forEach(async (collab) => {
//       if (collab.name !== artist.name) {
//         const update = { name: 'collaborator', 'track.name': songItem.name, 'track.spotifyId': songItem.id }
//         await Link.findOneAndUpdate({ source: artist.name, target: collab.name },
//           {
//             $setOnInsert: { source: artist.name, target: collab.name },
//             $addToSet: { relationship: update }
//           },
//           { upsert: true, new: true, useFindAndModify: false })
//           .exec((err, conn) => {
//             if (err) console.error(err)
//           })
//       }
//     })
//   })
//
//   return { name: songItem.name, url: songItem.album.images[0].url, artist: songItem.artists[0].name, album: songItem.album.name, spotifyId: songItem.id }
// } else {
//   return 404
// }

// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, '/public/index.html'))
// })
//
// app.get('/suggest', (req, res) => {
//   res.sendFile(path.join(__dirname, '/public/suggest.html'))
// })

app.get('/node', (req, res) => {
  Node.find().exec((err, node) => {
    if (err) console.error(err)
    res.send(node)
  })
})

app.get('/link', (req, res) => {
  Link.find().exec((err, link) => {
    if (err) console.error(err)
    res.send(link)
  })
})

app.post('/insert', async (req, res) => {
  try {
    const { artist, related, relationship, quote, source, title, song } = req.body

    // TODO: account for cases outside of current extension
    let update
    if (song && song.spotifyId) {
      update = {
        name: relationship,
        track: {
          name: song.songTitle,
          spotifyId: song.spotifyId
        },
        ref: {
          quote,
          title,
          url: source
        }
      }
    } else {
      update = {
        name: relationship,
        ref: {
          quote,
          title,
          url: source
        }
      }
    }
    Link.findOneAndUpdate({ source: artist, target: related },
      {
        $setOnInsert: { source: artist, target: related },
        $addToSet: { relationship: update }
      },
      { upsert: true, new: true, useFindAndModify: false })
      .exec((err, conn) => {
        if (err) console.error(err)
      })

    if (relationship === 'collaborator') { // bidirectional relationship
      Link.findOneAndUpdate({ source: related, target: artist },
        {
          $setOnInsert: { source: related, target: artist },
          $addToSet: { relationship: update }
        },
        { upsert: true, new: true, useFindAndModify: false })
        .exec((err, conn) => {
          if (err) console.error(err)
        })
    } else if (relationship === 'cover') { // bidirectional relationship
      update.name = 'covered'
      Link.findOneAndUpdate({ source: related, target: artist },
        {
          $setOnInsert: { source: related, target: artist },
          $addToSet: { relationship: update }
        },
        { upsert: true, new: true, useFindAndModify: false })
        .exec((err, conn) => {
          if (err) console.error(err)
        })
    }

    res.send('OK')
  } catch (err) {
    console.error(err)
  }
})

// TODO: do this client side / we're gonna change this entirely
app.post('/verify', [
  check('artist').exists({ checkFalsy: true }).isString(),
  check('related').exists({ checkFalsy: true }).isString(),
  check('relationship').exists({ checkFalsy: true }).isString(),
  check('source').optional({ checkFalsy: true }).isURL(),
  check('song').optional({ checkFalsy: true }).isString()
], (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const fields = []
    errors.errors.forEach(err => fields.push(err.param))
    return res.status(400).json({ fields })
  } else {
    return res.sendStatus(200)
  }
})

app.get('/validate-artist', async (req, res) => {
  if (req.query.artist === '') return
  const artist = await searchArtist(req.query.artist)
  res.send(artist)
})

app.get('/validate-song', async (req, res) => {
  if (req.query.song === '') return
  const results = await searchSong(req.query.song.replace(/[“”‘’''""]/g, ''))
  res.send(results)
})

app.get('/connections', (req, res) => {
  if (req.query.name === '') return
  // return links in order of descending strength
  Link.aggregate([
    { $match: { source: req.query.name } },
    {
      $project: {
        source: true,
        target: true,
        relationship: true,
        targetImg: true,
        strength: { $size: '$relationship' }
      }
    },
    { $sort: { strength: -1 } }
  ]).exec((err, data) => {
    if (err) console.error(err)
    res.send(data)
  })
})

app.post('/clipped', async (req, res) => {
  const { selected, page, title, tag } = req.body
  if (page.includes('wikipedia')) {
    res.redirect('http://localhost:3000/failure')
  }

  const created = await Clipped.create({ quote: selected, pageUrl: page, pageTitle: title, tag })
  res.redirect(`http://localhost:3000/suggest?id=${created._id}`)
})

app.get('/clipped', (req, res) => {
  const { id } = req.query
  Clipped.findOne({ _id: id }).exec((err, clip) => {
    if (err) console.error(err)
    res.send(clip)
  })
})

app.get('/update', async (req, res) => {
  const links = await Link.find({}).exec()
  for (const link of links) {
    const targetNode = await Node.findOne({ name: link.target })
    console.log('updating: ', targetNode.name, link.source)
    await Link.findOneAndUpdate({ _id: link.id }, { targetImg: targetNode.imageUrl })
  }
})

app.get('/update_album', async (req, res) => {
  const links = await Link.find({}).exec()
  for (const link of links) {
    const rels = link.relationship
    for (let i = 0; i < rels.length; i++) {
      if (rels[i].track) {
        const token = await accessSpotify()
        const response = await axios({
          method: 'get',
          url: `https://api.spotify.com/v1/tracks/${rels[i].track.spotifyId}`,
          headers: {
            Authorization: 'Bearer ' + token
          }
        })
        console.log('response: ', response)
      }
    }
    // const targetNode = await Node.findOne({ name: link.target })
    // console.log('updating: ', targetNode.name, link.source)
    // await Link.findOneAndUpdate({ _id: link.id }, { 'relationship.${i}.track.album': targetNode.imageUrl })
  }
})

app.listen(port, () => console.log('listening on port 8888'))

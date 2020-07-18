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
  relationship: [{
    name: String,
    track: {
      name: String,
      spotifyId: String
    },
    ref: String,
    _id: false
  }]
})

var nodeSchema = new Schema({
  name: String,
  spotifyUrl: String,
  imageUrl: String
})

var Link = mongoose.model('Link', linkSchema, 'link')
var Node = mongoose.model('Node', nodeSchema, 'node')

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

    const result = response.data.artists.items[0]
    const clean = result.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    if (artist.toLowerCase() === clean.toLowerCase()) {
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

async function searchSong (song, artist) {
  try {
    const token = await accessSpotify()
    let response = await axios({
      method: 'get',
      url: 'https://api.spotify.com/v1/search',
      headers: {
        Authorization: 'Bearer ' + token
      },
      params: {
        q: `track:${song} artist:${artist}`,
        type: 'track',
        limit: 10
      }
    })

    if (response.data.tracks.items.length === 0) {
      response = await axios({
        method: 'get',
        url: 'https://api.spotify.com/v1/search',
        headers: {
          Authorization: 'Bearer ' + token
        },
        params: {
          q: `track:${song}`,
          type: 'track',
          limit: 10
        }
      })
    }

    if (response.data.tracks.length === 0) return

    const result = response.data.tracks.items
    const songItem = result.find(item => {
      return item.name.toLowerCase().replace(/[“”‘’''""]/g, '').startsWith(song.toLowerCase())
    })

    console.log('songItem: ', songItem)

    if (songItem) {
      return { name: songItem.name, url: songItem.album.images[0].url, artist: songItem.artists[0].name, album: songItem.album.name, spotifyId: songItem.id }
    } else {
      return 404
    }
  } catch (err) {
    console.error('spotify song search error: ', err)
  }
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'))
})

app.get('/suggest', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/suggest.html'))
})

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
    const { artist, related, relationship, source, song } = req.body

    const update =
      song ? { name: relationship, 'track.name': song.name, 'track.spotifyId': song.spotifyId, ref: source } : { name: relationship, track: null, ref: source }

    Link.findOneAndUpdate({ source: artist, target: related },
      {
        $setOnInsert: { source: artist, target: related },
        $addToSet: { relationship: update }
      },
      { upsert: true, new: true, useFindAndModify: false })
      .exec((err, conn) => {
        if (err) console.error(err)
      })

    if (relationship === 'collaborator' || relationship === 'cover') { // bidirectional relationships
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
  const song = await searchSong(req.query.song.replace(/[“”‘’''""]/g, ''), req.query.artist)
  res.send(song)
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
        strength: { $size: '$relationship' }
      }
    },
    { $sort: { strength: -1 } }
  ]).exec((err, data) => {
    if (err) console.error(err)
    res.send(data)
  })
})

app.listen(port, () => console.log('listening on port 8888'))

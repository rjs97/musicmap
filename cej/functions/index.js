const express = require('express')
const functions = require('firebase-functions')
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
  .use(cors({ origin: true }))
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
        limit: 5
      }
    })

    if (response.data.artists.length === 0) return

    const result = response.data.artists.items

    let i = 0
    const ret = result.map((res) => {
      i++
      const spotifyUrl = res.external_urls ? res.external_urls.spotify : ''
      const imageUrl = (res.images && res.images[0]) ? res.images[0].url : ''
      return {
        _id: i,
        name: res.name,
        spotifyUrl,
        imageUrl
      }
    })

    return ret.filter((r) => r.imageUrl !== '')
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
        albumTitle: res.album.name,
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
    const { artist, related, rel, quote, source, title, songs } = req.body

    await Node.findOneAndUpdate({ name: artist.name }, {
      name: artist.name,
      spotifyUrl: artist.spotifyUrl,
      imageUrl: artist.imageUrl
    }, { upsert: true, new: true, useFindAndModify: false }).exec()

    await Node.findOneAndUpdate({ name: related.name }, {
      name: related.name,
      spotifyUrl: related.spotifyUrl,
      imageUrl: related.imageUrl
    }, { upsert: true, new: true, useFindAndModify: false }).exec()

    let ref = null
    if (quote) {
      ref = { quote, title, url: source }
    } else {
      ref = { title, url: source }
    }

    const updates = []
    if (songs.length > 0) {
      songs.forEach((song) => {
        updates.push({
          name: rel,
          track: {
            name: song.songTitle,
            spotifyId: song.spotifyId,
            album: song.albumTitle
          },
          ref
        })
      })
    } else {
      updates.push({ name: rel, ref })
    }

    updates.forEach((update) => {
      Link.findOneAndUpdate({ source: artist.name, target: related.name },
        {
          $setOnInsert: { source: artist.name, target: related.name, targetImg: related.imageUrl },
          $addToSet: { relationship: update }
        },
        { upsert: true, new: true, useFindAndModify: false })
        .exec((err, conn) => {
          if (err) console.error(err)
        })

      if (rel === 'collaborator') { // bidirectional relationship
        Link.findOneAndUpdate({ source: related.name, target: artist.name },
          {
            $setOnInsert: { source: related.name, target: artist.name, targetImg: artist.imageUrl },
            $addToSet: { relationship: update }
          },
          { upsert: true, new: true, useFindAndModify: false })
          .exec((err, conn) => {
            if (err) console.error(err)
          })
      } else if (rel === 'cover') { // bidirectional relationship
        update.name = 'covered'
        Link.findOneAndUpdate({ source: related.name, target: artist.name },
          {
            $setOnInsert: { source: related.name, target: artist.name, targetImg: artist.imageUrl },
            $addToSet: { relationship: update }
          },
          { upsert: true, new: true, useFindAndModify: false })
          .exec((err, conn) => {
            if (err) console.error(err)
          })
      }
    })

    res.send('OK')
  } catch (err) {
    console.error(err)
  }
})

app.get('/validate-artist', async (req, res) => {
  if (req.query.artist === '') return
  const artist = await searchArtist(req.query.artist.replace(/[“”‘’''""]/g, ''))
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
    res.redirect('https://cotton-eyed-joe.web.app/failure')
  }

  const created = await Clipped.create({ quote: selected, pageUrl: page, pageTitle: title, tag })
  res.redirect(`https://cotton-eyed-joe.web.app/suggest?id=${created._id}`)
})

app.get('/clipped', (req, res) => {
  const { id } = req.query
  Clipped.findOne({ _id: id }).exec((err, clip) => {
    if (err) console.error(err)
    res.send(clip)
  })
})

exports.widgets = functions.https.onRequest(app)

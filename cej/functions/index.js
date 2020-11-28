const express = require('express')
const functions = require('firebase-functions')
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
  strength: Number
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

var coverSchema = new Schema({
  linkId: String,
  type: String,
  track: {
    name: String,
    album: String,
    artists: [String],
    src: String,
    id: String
  },
  origTrack: {
    name: String,
    album: String, // optional for YT
    artists: [String], // missing for YT rn
    src: String,
    id: String
  },
  addlRef: [String] // optional
})

var refSchema = new Schema({
  linkId: String,
  quote: String, // optional
  src: String,
  title: String,
  type: String, // influence or reference
  content: {
    name: String,
    album: String, // optional for albums && artists
    artists: [String], // optional for artists
    src: String,
    id: String
  }
})

var collabSchema = new Schema({
  linkId: String,
  content: {
    name: String,
    album: String, // optional for albums
    artists: [String],
    src: String,
    id: String
  }
})

const Collab = mongoose.model('Collab', collabSchema, 'collab')
const Cover = mongoose.model('Cover', coverSchema, 'cover')
const Ref = mongoose.model('Ref', refSchema, 'ref')

const Link = mongoose.model('Link', linkSchema, 'link')
const Node = mongoose.model('Node', nodeSchema, 'node')
const Clipped = mongoose.model('Clipped', clippedSchema, 'clipped')

const COVER_RELATIONSHIPS = {
  cover: 'covered',
  sample: 'sampled',
  interpolation: 'interpolated'
}

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
    } else {
      return null
    }

  } catch (err) {
    console.error('spotify auth error: ', err)
    return null
  }
}

async function searchAlbum (album) {
  try {
    const token = await accessSpotify()
    const response = await axios({
      method: 'get',
      url: 'https://api.spotify.com/v1/search',
      headers: {
        Authorization: 'Bearer ' + token
      },
      params: {
        q: album,
        type: 'album',
        limit: 5
      }
    })

    if (response.data.albums.length === 0) return null

    const result = response.data.albums.items

    let i = 0
    const ret = result.map((res) => {
      i++
      const artists = res.artists.map((a) => {
        const spotifyUrl = a.external_urls ? a.external_urls.spotify : ''
        return {
          name: a.name,
          spotifyUrl,
          href: a.href
        }
      })

      const spotifyUrl = res.external_urls ? res.external_urls.spotify : ''
      const imageUrl = (res.images && res.images[0]) ? res.images[0].url : ''
      return {
        _id: i,
        name: res.name,
        artists,
        spotifyId: res.id,
        spotifyUrl,
        imageUrl
      }
    })

    return ret.filter((r) => r.imageUrl !== '')
  } catch (err) {
    console.error('spotify album search error: ', err)
    return null
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

    if (response.data.artists.length === 0) return null

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
    return null
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

    if (response.data.tracks.length === 0) return null

    const result = response.data.tracks.items

    let i = 0
    const ret = result.map((res) => {
      i++
      const artists = res.artists.map((a) => {
        const spotifyUrl = a.external_urls ? a.external_urls.spotify : ''
        return {
          name: a.name,
          spotifyUrl,
          href: a.href
        }
      })

      const spotifyUrl = res.external_urls ? res.external_urls.spotify : ''
      return {
        _id: i,
        albumTitle: res.album.name,
        albumUrl: res.album.images[0].url,
        name: res.name,
        artists: artists,
        spotifyId: res.id,
        spotifyUrl
      }
    })

    return ret
  } catch (err) {
    console.error('spotify song search error: ', err)
    return null
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

app.post('/insert-collab', async (req, res) => {
  try {
    const { artists, content } = req.body

    // make sure all the artists nodes exist
    await Promise.all(artists.map(async (a) => {
      if (!a.imageUrl) {
        const token = await accessSpotify()
        const artistRes = (await axios({
          method: 'get',
          url: a.href,
          headers: {
            Authorization: 'Bearer ' + token
          }
        })).data

        a.imageUrl = (artistRes.images && artistRes.images[0]) ? artistRes.images[0].url : ''
      }
      await Node.findOneAndUpdate({ name: a.name }, {
        name: a.name,
        spotifyUrl: a.spotifyUrl,
        imageUrl: a.imageUrl
      }, { upsert: true, new: true, useFindAndModify: false }).exec()
    }))

    artists.forEach((a) => {
      artists.forEach(async (b) => {
        if (a.name === b.name) { return }

        const link = await Link.findOneAndUpdate({ source: a.name, target: b.name }, {
          $setOnInsert: {
            source: a.name,
            target: b.name,
            targetImg: (artists.find((ar) => ar.name === b.name)).imageUrl,
            strength: 0
          }
        },
        { upsert: true, new: true, useFindAndModify: false }).exec()

        const update = {
          name: content.name,
          artists: content.artists.map((a) => a.name),
          src: content.spotifyUrl,
          id: content.spotifyId
        }

        if (content.albumTitle) {
          update.album = content.albumTitle
        }

        const res = await Collab.findOneAndUpdate({ linkId: link._id, 'content.id': update.id },
          { linkId: link._id, content: update }, { upsert: true, rawResult: true, new: true, useFindAndModify: false })

        if (!res.lastErrorObject.updatedExisting) {
          await Link.findOneAndUpdate({ source: a.name, target: b.name }, { $inc: { strength: 1 } }, { useFindAndModify: false })
        }
      })
    })
    res.send('OK')
  } catch (err) {
    console.error(err)
  }
})

app.post('/insert-cover', async (req, res) => {
  try {
    const { artists, origSong, song, rel } = req.body

    // make sure all the artists nodes exist
    await Promise.all(artists.map(async (a) => {
      if (!a.imageUrl) {
        const token = await accessSpotify()
        const artistRes = (await axios({
          method: 'get',
          url: a.href,
          headers: {
            Authorization: 'Bearer ' + token
          }
        })).data
        a.imageUrl = (artistRes.images && artistRes.images[0]) ? artistRes.images[0].url : ''
      }
      await Node.findOneAndUpdate({ name: a.name }, {
        name: a.name,
        spotifyUrl: a.spotifyUrl,
        imageUrl: a.imageUrl
      }, { upsert: true, new: true, useFindAndModify: false }).exec()
    }))

    song.artists.forEach((a) => {
      origSong.artists.forEach(async (b) => {
        if (a.name === b.name) { return }

        const link = await Link.findOneAndUpdate({ source: a.name, target: b.name }, {
          $setOnInsert: {
            source: a.name,
            target: b.name,
            targetImg: (artists.find((ar) => ar.name === b.name)).imageUrl,
            strength: 0
          }
        },
        { upsert: true, new: true, useFindAndModify: false }).exec()

        const revLink = await Link.findOneAndUpdate({ source: b.name, target: a.name }, {
          $setOnInsert: {
            source: b.name,
            target: a.name,
            targetImg: (artists.find((ar) => ar.name === a.name)).imageUrl,
            strength: 0
          }
        },
        { upsert: true, new: true, useFindAndModify: false }).exec()

        const origTrack = {
          name: origSong.name,
          album: origSong.albumTitle,
          artists: origSong.artists.map((ar) => ar.name),
          id: origSong.spotifyId
        }

        const track = {
          name: song.name,
          album: song.albumTitle,
          artists: song.artists.map((ar) => ar.name),
          id: song.spotifyId
        }

        const cover = await Cover.findOneAndUpdate({ linkId: link._id, 'track.id': track.id },
          { linkId: link._id, type: rel, origTrack, track }, { upsert: true, new: true, rawResult: true, useFindAndModify: false })
        if (!cover.lastErrorObject.updatedExisting) {
          await Link.findOneAndUpdate({ _id: cover.linkId }, { $inc: { strength: 1 } }, { useFindAndModify: false })
        }

        const revCover = await Cover.findOneAndUpdate({ linkId: revLink._id, 'track.id': track.id },
          { linkId: revLink._id, type: COVER_RELATIONSHIPS[rel], origTrack, track }, { upsert: true, new: true, rawResult: true, useFindAndModify: false })
        if (!revCover.lastErrorObject.updatedExisting) {
          await Link.findOneAndUpdate({ _id: revCover.linkId }, { $inc: { strength: 1 } }, { useFindAndModify: false })
        }
      })
    })
    res.send('OK')
  } catch (err) {
    console.error(err)
  }
})

app.get('/validate-album', async (req, res) => {
  if (req.query.album === '') return
  const results = await searchAlbum(req.query.album.replace(/[“”‘’''""]/g, ''))
  res.send(results)
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

app.get('/connections', async (req, res) => {
  if (req.query.name === '') return
  // return links in order of descending strength
  const data = await Link.aggregate([
    { $match: { source: req.query.name, strength: { $gt: 0 } } },
    {
      $project: {
        source: true,
        target: true,
        targetImg: true,
        strength: true
      }
    },
    { $sort: { strength: -1 } }
  ]).exec()
  res.send(data)
})

app.get('/relationships', async (req, res) => {
  if (req.query.linkId === '') return
  const link = await Link.findOne({ _id: req.query.linkId }).exec()
  const response = {
    artist: link.source,
    related: link.target
  }

  if (req.query.type) {
    if (req.query.type === 'collab') {
      console.log('sending collab')
      response.collab = await Collab.find({ linkId: req.query.linkId }).exec()
    }
    if (req.query.id === '') return
    if (req.query.type === 'cover') {
      console.log('sending cover')
      response.cover = await Cover.findOne({ _id: req.query.id }).exec()
    } else if (req.query.type === 'ref') {
      console.log('sending ref')
      response.ref = await Ref.findOne({ _id: req.query.id }).exec()
    } else {
      // throw error
    }
  } else {
    response.cover = await Cover.find({ linkId: req.query.linkId }).exec()
    response.ref = await Ref.find({ linkId: req.query.linkId }).exec()
    response.collab = await Collab.find({ linkId: req.query.linkId }).exec()
  }

  res.send(response)
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

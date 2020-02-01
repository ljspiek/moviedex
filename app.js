require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const cors = require('cors')
const MOVIES = require('./movies-data-small.json')

const app = express()

const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common'

app
  .use(morgan(morganSetting))
  .use(helmet())
  .use(cors())

app.use(function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN
  const authToken = req.get('Authorization')

  if (!authToken || authToken.split(' ')[1] !== apiToken) {
    return res.status(401).json({ error: 'Unauthorized request' })
  }
  next() // move to the next middleware
})

app.get('/movies', function handleGetMovies(req, res) {
  let response = MOVIES
  const { genre, country, avg_vote } = req.query
  if (genre) {
    response = response.filter(movie =>
        movie.genre.toLowerCase().includes(genre.toLowerCase())
      )
  }
  if (country) {
    response = response.filter(movie =>
        movie.country.toLowerCase().includes(country.toLowerCase())
      )
  }
  if (avg_vote) {
    let vote = Number(avg_vote)
    response = response.filter(movie => movie.avg_vote >= vote)
    
  }
  res.json(response)
})

app.get('/', (req, res) => {
  res.json('hello')
})

app.use((error, req, res, next) => {
  let response
  if (process.env.NODE_ENV === 'production') {
    response = { error: { message: 'server error'}}
  } else {
    response = {error}
  }
  res.status(500).json(response)

})

module.exports = app
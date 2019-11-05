const http = require('http')
const url = require('url')
const router = require('http-hash-router')()
const sendJson = require('send-data/json')

const api = require('./api')

module.exports = function createServer () {
  return http.createServer(handler)
}

addApiEndpoints()

function handler (req, res) {
  if (req.url === `/health`) return sendJson(req, res, {success: true})
  const query = url.parse(req.url).query
  router(req, res, {query}, onError.bind(null, req, res))
}

function onError (req, res, err) {
  if (!err) {
    console.log('No error given to error handler')
    return
  }

  res.statusCode = err.statusCode || 500
  sendJson(req, res, {
    error: err.message || http.STATUS_CODES[res.statusCode]
  })
}

function addApiEndpoints () {
  router.set(`/buyers`, {POST: api.postBuyer})
  router.set(`/buyers/:id`, {GET: api.getBuyer})
  router.set(`/route`, {GET: api.getRoute})
}

const querystring = require('querystring')
const sendJson = require('send-data/json')

const redis = require('../src/redis')

module.exports = {
  postBuyer,
  getBuyer,
  getRoute
}

function postBuyer (req, res, opts, cb) {
  const data = []
  req.on('data', chunk => data.push(chunk))
  req.on('end', () => {
    let buyer

    try {
      buyer = JSON.parse(data.join(''))
      // in production, I'd also like to do object/type validation of input
    } catch (exception) {
      cb({
        statusCode: 500,
        message: 'Error parsing new buyer data: ' + exception.message
      })
      return
    }

    redis.setBuyer(buyer, (err, reply) => {
      if (err) {
        cb({
          statusCode: 500,
          message: 'Error in data layer under postBuyer: ' + err.message
        })
        return
      }

      res.statusCode = 201
      sendJson(req, res, {body: reply, statusCode: 201})
    })
  })
}

function getBuyer (req, res, opts, cb) {
  const id = opts.params.id
  redis.getBuyer(id, (err, buyer) => {
    if (err) {
      if (err === 'not found') {
        cb({
          statusCode: 404,
          message: 'Requested buyer not found'
        })
        return
      } else {
        cb({
          statusCode: 500,
          message: 'Error in data layer under getBuyer'
        })
        return
      }
    }

    sendJson(req, res, buyer)
  })
}

function getRoute (req, res, opts, cb) {
  const query = querystring.parse(opts.query)
  const apiOpts = {req, res, cb}

  redis.getRoute(query, getRouteCallback.bind(null, apiOpts))
}

function getRouteCallback (apiOpts, err, location) {
  if (err) {
    if (err === 'not found') {
      apiOpts.cb({
        statusCode: 204,
        message: 'No matching route available'
      })
      return
    }
    apiOpts.cb(err)
    return
  }

  apiOpts.res.writeHead(302, {location})
  apiOpts.res.end()
}

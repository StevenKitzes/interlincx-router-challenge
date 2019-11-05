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

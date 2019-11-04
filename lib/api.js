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
    const buyer = JSON.parse(data.join(''))
    redis.setBuyer(buyer, (err, reply) => {
      if (err) {
        cb({
          statusCode: 500,
          message: 'Error in postBuyer API'
        })
        return
      }

      res.statusCode = 201
      sendJson(req, res, {body: reply, statusCode: 201})
    })
  })
}

var redis = process.env.NODE_ENV === 'test'
  ? require('fakeredis')
  : require('redis')

module.exports = {
  setBuyer,
  getBuyer,
  getRoute
}

const client = redis.createClient()
client.on('connect', () => {
  console.log('Redis local connection established')
})
client.on('error', (err) => {
  console.log('Redis error:', err)
})
if (process.env.NODE_ENV !== 'test') client.flushall()

function setBuyer (buyer, cb) {
  try {
    client.del(buyer.id)
    buyer.offers.forEach(offer => {
      client.rpush(buyer.id, JSON.stringify(offer))
    })
    client.rpush('buyers', buyer.id)
    cb(null, {success: true})
  } catch (exception) {
    console.log('Exception caught in Redis setBuyer')
    cb(exception)
  }
}

function getBuyer (id, cb) {
  client.exists(id, (err, exists) => {
    if (err) cb(err)

    if (!exists) {
      cb('not found')
      return
    }

    client.lrange(id, 0, -1, (err, results) => {
      if (err) cb(err)
      const buyer = {
        id,
        offers: results.map(result => JSON.parse(result))
      }
      cb(null, buyer)
    })
  })
}

function getRoute (params, cb) {
  client.lrange('buyers', 0, -1, (err, buyerKeyList) => {
    if (err) {
      cb(err)
      return
    }

    processOffers(buyerKeyList, params, cb)
  })
}

function processOffers (buyerKeyList, params, cb) {
  const offers = []
  let buyersProcessed = 0

  if (buyerKeyList.length < 1) {
    cb('not found')
    return
  }

  buyerKeyList.forEach(key => {
    client.lrange(key, 0, -1, (err, offerStrings) => {
      if (err) return

      offerStrings.forEach(offerString => {
        offers.push(JSON.parse(offerString))
      })

      buyersProcessed++

      if (buyersProcessed === buyerKeyList.length) {
        sendBestOfferLocation(offers, params, cb)
      }
    })
  })
}

function sendBestOfferLocation (offers, params, cb) {
  const time = new Date(params.timestamp)
  const targetHour = time.getUTCHours()
  const targetDay = time.getUTCDay()
  let highestValue = Number.MIN_SAFE_INTEGER
  let location

  offers.forEach(offer => {
    if (offer.criteria.hour.indexOf(targetHour) < 0) return
    if (offer.criteria.day.indexOf(targetDay) < 0) return
    if (offer.criteria.state.indexOf(params.state) < 0) return
    if (offer.criteria.device.indexOf(params.device) < 0) return
    if (offer.value > highestValue) {
      highestValue = offer.value
      location = offer.location
    }
  })

  cb(null, location)
}

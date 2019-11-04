var redis = process.env.NODE_ENV === 'test'
  ? require('fakeredis')
  : require('redis')

module.exports = {
  setBuyer
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

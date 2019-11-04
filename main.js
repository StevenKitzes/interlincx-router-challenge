const server = require('./lib/server')

const port = process.env.PORT || 1337

server().listen(port, () => {
  console.log(`Server listening on port ${port}`)
})

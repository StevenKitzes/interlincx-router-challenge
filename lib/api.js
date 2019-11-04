const sendJson = require('send-data/json')

module.exports = {
  test,
  testError
}

function test (req, res, opts, cb) {
  sendJson(req, res, {test: 'success'})
}
function testError (req, res, opts, cb) {
  cb({
    message: 'test error',
    statusCode: 500
  })
}

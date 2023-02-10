const { processCallbackRouter, handleCallback: handleStoreCallback, init } = require('./routers')()
init(process)

module.exports = {
    get: object => processCallbackRouter('store')({ method: 'get', object }),
    set: (object, data) => processCallbackRouter('store')({ method: 'set', object, data}),
    delete: object => processCallbackRouter('store')({ method: 'delete', object }),
    handleStoreCallback
  }
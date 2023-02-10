const Store = require('electron-store')

const schema = require('./schema')

const store = new Store({
  schema,
  name: 'profiles',
  // encryptionKey: 'CapsuleCooks',
  fileExtension: 'config',
})

module.exports = store

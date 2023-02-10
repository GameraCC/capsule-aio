const { v4: uuidv4 } = require('uuid')

module.exports = emitter => {
  let Emitter = emitter

  const callbacks = []

  const processCallbackRouter = action =>
    params =>
      new Promise(async (resolve, reject) => {
        const id = uuidv4()

        callbacks.push({
          id,
          callback: (err, data) => {
            if (err) return reject(err)
            return resolve(data)
          },
        })

        Emitter &&
          (Emitter.send ? Emitter.send({ action, id, params }) : Emitter({ action, id, params }))
      })

  function handleCallback(id, { err, data }) {
    const i = callbacks.findIndex(x => x.id === id)
    if (i < 0) return

    callbacks[i].callback(err, data)
    callbacks.splice(i, 1)
  }

  function init(emitter) {
    Emitter = emitter
  }

  return {
    processCallbackRouter,
    handleCallback,
    callbacks,
    init
  }
}

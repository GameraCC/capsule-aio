const WebSocket = require('ws')
const Request = require('../qq-request')
const { auth_v1, auth_v2 } = require('../login')
const { setRequest, setApiKey, getNokamai, getPixel, getInitialFingerprint } = require('./token')
const analytics = require('../tasks/analytics')
const store = require('./processStore')

let lic
let licTimer
let ws
let retry = 0
let initialLiveVariables = undefined
let liveVariableCallback = liveVariables => undefined
let WSMessageRouterWorkerThreadCallback = arg => undefined

const request = (params, callback) => Request({ ...params, lic: lic || params.lic }, callback)
setRequest(request)

const createLiveVariableCallback = callback => (liveVariableCallback = callback)

const sendLoginMessage = (message, status) => process.send({ action: 'loginStatus', params: { message, status: status || 'status' } })

const setWSMessageRouterWorkerThreadCallback = callback => WSMessageRouterWorkerThreadCallback = callback

function authenticate(licenseKey) {
  return new Promise(async (res, rej) => {
    console.log(`Bind request! Key was ${licenseKey}`)

    sendLoginMessage('Connecting to Capsule AIO.')

    let bind = await store.get('bind')

    /**
     * V1 Bind
     *
     * This is the first step of the auth process that binds the client to the user's key. This
     * only needs to be done once, and afterwards each subsequent login will go directly to connecting
     * to the websocket, as long as no issues arise.
     */

    if (bind?.license !== licenseKey) {
      await store.delete('bind')
      bind = undefined
    }

    if (typeof bind === 'undefined') {
      sendLoginMessage('Binding key.')

      try {
        const { capsuleKey, key, secret } = await auth_v1(licenseKey)

        await store.set('bind', {
          license: licenseKey,
          key,
          secret,
          capsuleKey,
        })
      } catch {
        // callback({ err: 'Error: Key is already bound.' })
        sendLoginMessage('Key is already bound.', 'error')
        await store.delete('bind')
        return rej()
      }
    }

    /**
     * V2
     *
     * This is where we create the websocket connection that will be used by various parts of the
     * app. The app will not function correctly without a live websocket.
     */

    try {
      const { capsuleKey, secret, license } = await store.get('bind')

      const url = auth_v2(capsuleKey, Buffer.from(secret, 'base64').toString('ascii'), license)
    //   console.log('url', url)

      ws = new WebSocket(url, [], {
        handshakeTimeout: 30000,
        maxPayload: 128 * 1024,
        skipUTF8Validation: true,
      })

      async function errorFunc(err) {
        console.error('Connection error', err)
        sendLoginMessage('Unable to connect.', 'error')

        if (retry++ < 3) {
          try {
            await store.delete('bind')
            await authenticate(licenseKey)
            return res()
          } catch {
            return rej()
          }
        } else return rej()
      }

      ws.on('error', errorFunc)

      ws.on('open', () => {
        console.log('Connection Open')
        sendLoginMessage('Connection Open.', 'success')
        retry = 0

        ws.removeListener('error', errorFunc)
        registerWsEvents()

        Sendify(JSON.stringify({ action: 'hello' }))
        startLicenseService()

        // todo
        // createWindow()
        // loginWindow.close()
        return res()
      })
    } catch (err) {
      console.error(err)
      sendLoginMessage('Unable to connect.', 'error')
      return rej(err)
      // callback({ err: 'Unable to connect. ' })
    }
  })
}

async function WsMessageRouter(arg) {
//   console.log('Message from WS', arg)
  const args = JSON.parse(arg)

  switch (args.action) {
    case 'qqrLic':
        lic = args.lic
        break
    case 'helloReturn':
      {
        const settings = await store.get('settings')
        await store.set('settings', {
          ...settings,
          id: args.id,
          username: args.username,
          discriminator: args.discriminator,
          avatar: args.avatar,
        })
      }
      break
    default:
      break
  }

  // Route the same websocket arguments to the worker thread
  WSMessageRouterWorkerThreadCallback(args)
}

/**
 * Routes websocket messages for worker threads
 * 
 * @param {*} arg - The arguments passed to the main websocket message router
 */
async function WSMessageRouterWorkerThread(args) {
    switch (args.action) {
        case 'qqrLic':
          lic = args.lic
          break
        case 'helloReturn':
          {
            setApiKey(args.key)
            lic = args.lic
            initialLiveVariables = args.liveVariables
          }
          break
        case 'liveVariables':
          liveVariableCallback(args.liveVariables)
          break
        default:
          break
      }
}

async function Sendify(payload) {
  const data = typeof payload === 'string' ? payload : JSON.stringify(payload)

  if (typeof ws === 'undefined') {
    wsSend(data)
    return
  }

  function wsSend(data) {
    if (ws && ws.send) {
      try {
        ws.send(data)
      } catch (err) {
        console.error('WS error', err)
      }
    } else {
      WsCloseHandler().then(() => wsSend(data))
    }
  }

  switch (ws.readyState) {
    case 1:
      wsSend(data)
      break
    case 0:
    case 2:
    case 3:
      WsCloseHandler().then(() => wsSend(data))
    default:
      break
  }
}

let lock
async function WsCloseHandler(event) {
  if (lock) {
    await lock
    return
  }

  licTimer && clearInterval(licTimer)
  console.log('Connection Closed')

  let i = 0

  const tryReconnect = () =>
    new Promise(async (resolve, reject) => {
      try {
        const { capsuleKey, secret, license } = await store.get('bind')

        const url = auth_v2(capsuleKey, Buffer.from(secret, 'base64').toString('ascii'), license)
        // console.log('url', url)
        ws = new WebSocket(url, [], {
          handshakeTimeout: 30000,
          maxPayload: 128 * 1024,
          skipUTF8Validation: true,
        })

        function errorFunc(err) {
          if (i++ < 3) {
            setTimeout(() => {
              console.log(`Reconnecting, attempt ${i}...`)
              tryReconnect()
                .then(() => resolve())
                .catch(() => reject())
            }, 3000 * i)
          } else return reject()
        }

        ws.on('error', errorFunc)

        ws.on('open', () => {
          console.log('Connection Reopened')
          registerWsEvents()
          Sendify(JSON.stringify({ action: 'hello' }))
          startLicenseService()
          ws.removeListener('error', errorFunc)
          resolve()
        })
      } catch {
        return reject()
      }
    })

  try {
    lock = tryReconnect()
    await lock
  } finally {
    lock = undefined
  }
}

function registerWsEvents() {
  ws.on('message', WsMessageRouter)
  ws.on('close', WsCloseHandler)
  ws.on('error', WsErrorHandler)
  ws.on('unexpected-response', WsUnexpectedHandler)
}

function WsErrorHandler(err) {
  console.error('Socket error', err)
}

function WsUnexpectedHandler(request, response) {
  console.error('Unexpected response from ws', request, response)
}

function startLicenseService() {
  licTimer = setInterval(() => Sendify(JSON.stringify({ action: 'getReqLic' })), 2 * 60 * 60 * 1000)
}


const sendAnalytic = (type, args) => {
    // Verify that the analytic type exists prior to sending it down the websocket
    if (!Object.values(analytics).includes(type)) {
        console.error(`Error while sending analytic. Backend analytic type "${type}" does not exist in stored analytic types`)
        return
    }

    Sendify({ action: 'analytics', type, params: {...args}})
}

module.exports = {
  request,
  authenticate,
  handleStoreCallback: store.handleStoreCallback,
  getInitialLiveVariables: () => initialLiveVariables,
  createLiveVariableCallback,
  getNokamai,
  getPixel,
  getInitialFingerprint,
  sendAnalytic,
  setWSMessageRouterWorkerThreadCallback,
  WSMessageRouterWorkerThread
}

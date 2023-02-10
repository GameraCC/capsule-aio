/**
 * Warning: Objects exported from this module may be less complex than they appear
 */
const { app } = require('electron')
const { fork } = require('child_process')
const { EventEmitter } = require('events')
const path = require('path')
const { callbacks, handleCallback, processCallbackRouter, init } = require('./routers')()
const store = require('../store')

let child,
    initialized = false,
    initializationCallback = () => undefined

/**
 * Child Process
 */

function initChild() {
  const child = fork(path.join(__dirname, 'main.processRunner.js'), {
    stdio: 'pipe',
    env: {
      ...process.env,
      UV_THREADPOOL_SIZE: 1024,
      CAPSULE_LOG_PATH: app.getPath('logs'),
    },
  })

  child.on('error', err => {
    console.error('[Main Process] Error in child:', err)

    console.error('Connected', child.connected)
  })

  child.on('exit', (code, signal) => {
    console.error('[Main Process] Exit child:', code, signal)
  })

  child.on('unhandledRejection', (reason, p) => {
    console.error('[Main Process] Error in child:', reason, 'Unhandled Rejection at Promise', p)
  })

  child.on('uncaughtException', err => {
    console.error('[Main Process] Error in child:', err, 'Uncaught Exception thrown')
    process.exit(1)
  })

  child.on('spawn', () => {
    child.stderr.on('data', data => {
      process.stderr.write(data)
    })
    child.stdout.on('data', data => {
        process.stdout.write(data)
      })  
  })

  child.on('message', async ({ action, id, params, event }) => {
    //   console.log('message from child', { action, id, params, event })

    switch (action) {
      case 'initialized':
          initialized = true
          initializationCallback()
          break
      case 'sendStatusMessage':
        taskManager.emit('sendStatusMessage', { statusUpdates: params.statusUpdates, event })
        break
      case 'openBrowser':
      case 'solveCaptcha':
        callbacks.push({ id, callback: (err, data) => child.send({ action: `${action}Return`, id, params: { err, data }, event }) })
        taskManager.emit(action, { id, params })
        break
      case 'getProxies':
      case 'createTask':
      case 'response':
        handleCallback(id, params)
        break
      case 'loginStatus':
        ws.emit('loginStatus', { message: params.message, status: params.status, event })
        break
      case 'login':
        handleCallback(id, { err: !params.success || undefined, data: params.success && { ...params } })
        break
      case 'store':
        storeHandler(id, params)
        break
      default:
        break
    }
  })

  return child
}

function storeHandler(id, { method, object, data }) {
  if (typeof object !== 'string') return
  const action = 'store'

  switch (method) {
    case 'get':
      child.send({ action, id, params: { data: store.get(object) } })
      break
    case 'set':
      if (typeof data === 'object') {
        store.set(object, data)
        child.send({ action, id, params: { data: true } })
      }
      break
    case 'delete':
      store.delete(object)
      child.send({ action, id, params: { data: true } })
    default:
      break
  }
}

/**
 *
 * WS
 *
 */

const ws = new EventEmitter()

ws.authenticate = processCallbackRouter('authenticate')

/**
 *
 * TaskManager
 *
 */

const taskManager = new EventEmitter()

taskManager.createTask = processCallbackRouter('createTask')
taskManager.startTask = id => child.send({ action: 'startTask', params: { id } })
taskManager.stopTask = id => child.send({ action: 'stopTask', params: { id } })
taskManager.deleteTask = id => child.send({action: 'deleteTask', params: { id }})
taskManager.editTask = ({id, editProps}) => child.send({ action: 'editTask', params: { id, editProps } })
taskManager.editAllTasks = ({editProps}) => child.send({ action: 'editAllTasks', params: { editProps } })
taskManager.openBrowserReturn = handleCallback
taskManager.solveCaptchaReturn = handleCallback

taskManager.proxyManager = {
  getProxies: processCallbackRouter('getProxies'),
  importGroups: ({ groups }) => child.send({ action: 'importProxyGroups', params: { groups } }),
  createGroup: ({ id, group_name }) => child.send({ action: 'createProxyGroup', params: { id, group_name } }),
  deleteGroup: ({ id }) => child.send({ action: 'deleteProxyGroup', params: { id } }),
  deleteProxy: ({ id, proxy }) => child.send({ action: 'deleteProxy', params: { id, proxy } }),
  addProxy: ({ id, proxy }) => child.send({ action: 'addProxy', params: { id, proxy } }),
}

const request = processCallbackRouter('request')

// Await startup of process runner process
const awaitProcessRunner = () => 
    new Promise((res, rej) => {
        try {
            console.log('Awaiting Process Runner Initialization')
            if (initialized) {
                console.log('Process Runner Initialized')
                return res()
            }
            else initializationCallback = () => {
                console.log('Process Runner Initialized')
                res()
            }
        } catch (err) {
            console.error('Error awaiting process runner initialization')
            return rej()
        }
    })

const restartProcess = async () => {
  try {
    console.log('Restarting Process Runner...')
    child.kill()
    child = undefined
    initialized = false
  } finally {
    child = initChild()
    init(child)
    const bind = store.get('bind')
    await awaitProcessRunner() // Await process runner prior to authenticating, because the worker threads may not be initialized, resulting in the live variables, and licenses not being set from helloReturn
    bind.license && ws.authenticate({ licenseKey: bind.license })
    console.log('Process Runner Successfully Restarted.')
  }
}

child = initChild()
init(child)

module.exports = {
  request,
  taskManager,
  ws,
  restartProcess,
  awaitProcessRunner
}

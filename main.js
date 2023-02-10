process.env.UV_THREADPOOL_SIZE = 1024

/**
 * Modules to control application life and create native browser window
 * This is the main entrypoint of the application and runs in the main thread.
 * Any non-presentation layer applications should be created here and defined as
 * objects in browser windows.
 */
const { app, BrowserWindow, ipcMain, MessageChannelMain, webContents, dialog } = require('electron')
const path = require('path')
const url = require('url')
const getPort = require('get-port')
const WebSocketServer = require('ws').Server
const store = require('./dist/store')
const sites = require('./dist/tasks/sites')
const io = require('./dist/main/io')()
const CaptchaSolver = require('./dist/captcha')
const {
  request,
  taskManager,
  ws,
  restartProcess,
  awaitProcessRunner
} = require('./dist/main/process')

let mainWindow
let loginWindow
let solver
let lock
let devPort1, devPort2

var port
var wss

// determine to start with webpack server or static files depending on if built or not
const startUrl = file =>
  process.env.ELECTRON_START_URL
    ? `${process.env.ELECTRON_START_URL}/${file}`
    : url.format({
      pathname: path.join(app.getAppPath(), `./${file}`),
      protocol: 'file:',
      slashes: true,
    })

async function main() {
  // app.disableHardwareAcceleration()
  lock = app.requestSingleInstanceLock()

  if (!lock) {
    app.quit()
  }

  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    } else if (loginWindow) {
      if (loginWindow.isMinimized()) loginWindow.restore()
      loginWindow.focus()
    }
  })
  app.allowRendererProcessReuse = false

  port = await getPort()
  app.commandLine.appendSwitch('remote-debugging-port', port)
  app.commandLine.appendSwitch('disable-site-isolation-trials')
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', login)

  // Quit when all windows are closed.
  app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    app.quit()
  })

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  // In this file you can include the rest of your app's specific main process
  // code. You can also put them in separate files and require them here

  if (!app.isPackaged && process.env.NODE_ENV === 'development' && process.env.DEV_WEBSOCKET_PORT) {
    const { port1, port2 } = new MessageChannelMain()
    devPort1 = port1
    devPort2 = port2

    wss = new WebSocketServer({
      port: process.env.DEV_WEBSOCKET_PORT,
    })

    wss.on('connection', async wsDev => {
      devPort2.start()

      wsDev.on('message', async message => {
        // console.log('received: %s', message)

        switch (message) {
          case 'restartProcessRunner':
            await restartProcess()
            devPort2.postMessage({ action: 'resetTasks' })
            break
          default:
            break
        }
      })
    })
  }

  /**
   * Handles the authentication event when a user
   * enters their license key at app splash screen.
   * @param {*} event
   * @param {*} arg
   */
  function authFn(event, arg) {
    // console.log('Message from ipcRenderer:', 'authenticate', arg)

    ipcMain.removeListener('authenticate', authFn)

    ws.authenticate({ licenseKey: arg.licenseKey })
      .then(() => {
        createWindow()
        loginWindow?.close()
      })
      .catch(() => {
        store.delete('bind')

        // if (retry++ < 2) authFn(event, arg)
        ipcMain.on('authenticate', authFn)
      })
  }

  ipcMain.on('authenticate', authFn)

  ipcMain.handle('request', async (event, arg) => {
    // console.log('Message from ipcRenderer:', 'request', arg)
    try{
      const data = await request(arg)
      return { data }
    } catch (err) {
      return { err }
    }
  })

  ipcMain.on('windowControl', async (event, arg) => {
    // console.log('Message from ipcRenderer:', arg)

    switch (arg.action) {
      case 'minimize':
        BrowserWindow.getFocusedWindow().minimize()
        break
      case 'quit':
        app.quit()
        break
      case 'close':
        BrowserWindow.getFocusedWindow().close()
        break
      case 'hide':
        BrowserWindow.getFocusedWindow().hide()
        break
      case 'showSolver':
        solver.windows.find(({ type }) => type === 'main').window.show()
      default:
        break
    }
  })

  ipcMain.handle('taskManager', async (event, arg) => {
    // console.log('Message from ipcRenderer:', 'taskManager', arg)

    switch (arg.action) {
      case 'getSites': {
        return JSON.parse(JSON.stringify(sites))
      }
      case 'getProxies': {
        const result = await taskManager.proxyManager.getProxies()
        return result
      }
      case 'createProxyGroup': {
        const { id, group_name } = arg
        taskManager.proxyManager.createGroup({ id, group_name })
        return
      }
      case 'deleteProxyGroup': {
        const { id } = arg
        taskManager.proxyManager.deleteGroup({ id })
        return
      }
      case 'deleteProxy': {
        const { id, proxy } = arg
        taskManager.proxyManager.deleteProxy({ id, proxy })
        return
      }
      case 'createProxy': {
        const { id, proxy } = arg
        taskManager.proxyManager.addProxy({ id, proxy })
        return
      }
      case 'createTask': {
        const result = await taskManager.createTask({ taskProps: arg.taskProps })
        return result
      }
      case 'startTask': {
        const { id } = arg
        taskManager.startTask(id)
        return
      }
      case 'deleteTask': {
          const { id } = arg
          taskManager.deleteTask(id)
          return
      }
      case 'editTask': {
        const { id, editProps } = arg
        taskManager.editTask({id, editProps})
        return
      }
      case 'editAllTasks': {
        const { editProps } = arg
        taskManager.editAllTasks({editProps})
        return
      }
      case 'stopTask': {
        const { id } = arg
        taskManager.stopTask(id)
        return
      }
      default:
        return
    }
  })

  ipcMain.handle('solver', async (event, arg) => {
    try {
      switch (arg.action) {
        case 'createNewSolverWindow': {
          const { proxy, autoClickCaptcha } = arg
          const result = await solver.createNewSolverWindow({ proxy, autoClickCaptcha })
          return result
        }

        // case 'getSolverSessionId': {
        //   const { solverId } = arg
        //   const result = solver.solvers.find(_solver => _solver.id === solverId)
        //   return result.session.id
        // }

        case 'createNewGoogleAccountSession': {
          const { solverId, name } = arg
          const solverInfo = solver.solvers.find(({ id }) => id === solverId)

          // Store previous session id to revert back from the temporarily created createNewGoogleAccount session to previous session, upon rejection of the createNewGoogleAccountSession property, possibly through refreshSolver
          let previousSessionId = solverInfo.session.id
          try {
            await solver.createNewGoogleAccountSession({ solverId, name })
          } catch (err) {
            await solver.updateSession({ solverId, sessionId: previousSessionId })
          }
          return
        }

        case 'deleteSolver': {
          const { solverId } = arg
          const solverInfo = solver.solvers.find(({ id }) => id === solverId)
          solver.deleteSolver({ solverId })
          solver.deleteSession({ sessionId: solverInfo.originalSessionId })
          return
        }

        case 'deleteSession': {
          const { solverId, sessionId } = arg
          const solverInfo = solver.solvers.find(({ id }) => id === solverId)

          console.log(solverId, sessionId)

          // A user can not delete the solver's original session id, this is only possible by deleting the entire solver
          if (solverInfo.originalSessionId === sessionId) return

          // Change the current session's session to it's original session, as the user must select the session on the current solver, to delete that session
          await solver.updateSession({ solverId, sessionId: solverInfo.originalSessionId })
          solver.deleteSession({ sessionId })
          return
        }

        case 'rotateProxy': {
          const { solverId, proxy } = arg
          solver.rotateProxy({ solverId, proxy })
          return
        }

        case 'updateSession': {
          const { solverId, sessionId } = arg
          await solver.updateSession({ solverId, sessionId })
          return
        }

        case 'importSessions': {
          const { sessions } = arg
          solver.importSessions({ sessions })
          return
        }

        case 'importSolvers': {
          const { solvers } = arg
          await solver.importSolvers({ solvers })
          return
        }

        case 'exportSessions':
          return solver.exportSessions()

        case 'exportSolvers':
          return solver.exportSolvers()

        case 'exportWindows': {
          return solver.windows.map(({ id, type }) => ({ id, type }))
        }

        case 'testSolver': {
          const { solverId } = arg
          await solver.testCaptcha({ solverId, type: 'RECAPTCHA_V2_VISIBLE', url: 'https://patrickhlauke.github.io/recaptcha', siteKey: '6Ld2sf4SAAAAAKSgzs0Q13IZhY02Pyo31S2jgOB5' })
          return
        }

        case 'refreshSolver': {
          const { solverId } = arg
          await solver.refreshSolver({ solverId })
          return
        }

        case 'createNewSatelliteSolver': {
          const { solverId } = arg
          console.log('solverId', solverId)
          const windowId = await solver.createNewSatelliteSolver()
          console.log('windowId', windowId)
          solver.changeSolverWindow({ solverId, windowId })
          return
        }

        case 'returnSatelliteSolver': {
          const { solverId } = arg
          const satelliteWindowId = solver.solvers.find(({ id }) => id === solverId).window.id
          console.log('satelliteWindowId', satelliteWindowId)
          const mainWindowId = solver.windows.find(({ type }) => type === 'main').id
          console.log('mainWindowId', mainWindowId)
          solver.changeSolverWindow({ solverId, windowId: mainWindowId })
          solver.deleteSolverWindow({ windowId: satelliteWindowId })
          return
        }

        case 'setFrontSolver': {
          const { solverId } = arg
          const _solver = solver.solvers.find(({ id }) => id === solverId)
          const { window } = _solver.window
          try {
            window.setTopBrowserView(_solver.view)
          } catch (err) {
            console.error('Unable to set top browser view for solver:', solverId, 'window:', _solver.window?.id, err.message)
          }
          return
        }

        default:
          break
      }
    } catch (err) {
      console.error(err)
      return
    }
  })

  ipcMain.handle('store', async (event, arg) => {
    // console.log('Message from ipcRenderer:', 'store', arg)

    switch (arg.action) {
      case 'exportBilling':
        try {
          const billing = store.get('billing')

          await io.export.billing(billing)
        } catch (err) {
          console.error('Unable to export billing.', err.message)
          throw new Error('Unable to export biling.')
        }
        return
      case 'importBilling':
        try {
          const profiles = await io.import.billing()

          const billing = store.get('billing')

          billing.profiles = [...billing.profiles, ...profiles]
          store.set('billing', billing)
        } catch (err) {
          console.error('Unable to import billing.', err.message)
          throw new Error('Unable to import billing.')
        }
        return
      default:
        break
    }
  })
}

/**
 * The login function launches the login window.
 *
 * The user types their activation key in the login window to activate their copy.
 * Once a user has logged in successfully, the login window will authenticate and close
 * itself on subsequent launches, unless the server declines the login because
 * their key has been reset.
 *
 * The user must already have a key bound to their account on the CapsuleAIO.com website.
 */
function login() {
  loginWindow = new BrowserWindow({
    width: 800,
    height: 560,
    webPreferences: {
      preload: path.join(__dirname + '/main.api.js'),
      nodeIntegration: false,
      enableRemoteModule: false,
      contextIsolation: true,
    },
    show: false,
    backgroundColor: '#191E28',
    frame: false,
    autoHideMenuBar: true,
    darkTheme: true,
    transparent: false,
    minHeight: 400,
    minWidth: 550,
  })

  if (app.isPackaged) loginWindow.removeMenu()

  loginWindow.loadURL(startUrl('login.html'))

  loginWindow.webContents.on('did-finish-load', () => {
    loginWindow.show()
    if (loginWindow.isMinimized()) loginWindow.restore()
    loginWindow.focus()

    function loginStatusFunc({ message, status }) {
      loginWindow?.webContents?.send('message', { type: 'loginStatus', message, status: status || 'status' })
    }

    ws.on('loginStatus', loginStatusFunc)
    loginWindow.on('close', () => ws.removeListener('loginStatus', loginStatusFunc))

    // dev
    if (!app.isPackaged && process.env.CAPSULE_NO_LOGIN) {
      createWindow()
      loginWindow.close()
      return
    }
  })
}

/**
 *
 * Main Window
 *
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname + '/main.api.js'),
      nodeIntegration: false,
      enableRemoteModule: false,
      contextIsolation: true,
    },
    show: false,
    backgroundColor: '#191E28',
    frame: false,
    autoHideMenuBar: true,
    darkTheme: true,
    transparent: false,
    minWidth: 1000,
    minHeight: 700,
  })

  if (app.isPackaged) mainWindow.removeMenu()
  else require('electron-context-menu')()

  mainWindow.on('closed', () => {
    app.quit()
  })

  // and load the index.html of the app.
  mainWindow.loadURL(startUrl('index.html'))

  // Open window once web contents are loaded
  mainWindow.webContents.on('did-finish-load', () => {
    /**
     * Captcha Solver
     */
    solver = new CaptchaSolver()

    /**
     * Taskmanager
     * Create and load proxies into taskmanager
     */
    const { port1, port2 } = new MessageChannelMain()

    taskManager.on('solveCaptcha', ({ id, params: { type, url, siteKey, action } }) =>
      solver
        .solveCaptcha({ type, url, siteKey, action })
        .then(data => taskManager.solveCaptchaReturn(id, { data }))
        .catch(err => taskManager.solveCaptchaReturn(id, { err })),
    )

    taskManager.on('openBrowser', ({ id, params: { type, url, content, user_agent, proxy } }) =>
      solver
        .openBrowser({ type, url, content, user_agent, proxy })
        .then(data => taskManager.openBrowserReturn(id, { data }))
        .catch(err => taskManager.openBrowserReturn(id, { err })),
    )

    taskManager.on('sendStatusMessage', ({ statusUpdates }) => {
      setImmediate(() => port2.postMessage({ statusUpdates }))
    })

    port2.start()
    mainWindow.webContents.postMessage('sendStatusMessagePort', null, [port1])
    mainWindow.webContents.postMessage('devPort', null, [devPort1]) 

    taskManager.proxyManager.importGroups({ ...store.get('proxies') })

    mainWindow.show()

    solver.initialize({ port }).catch(err => console.error('captcha error:', err))
  })
}

main()

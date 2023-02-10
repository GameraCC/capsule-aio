// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { contextBridge, ipcRenderer } = require('electron')
const store = require('./dist/store')

const windowLoaded = new Promise(resolve => {
  window.onload = resolve
})

// Receive MessageChannelMain port and send it to the window
ipcRenderer.on('sendStatusMessagePort', async event => {
  await windowLoaded

  window.postMessage('sendStatusMessagePort', '*', event.ports)
})

// Receive MessageChannelMain port and send it to the window
ipcRenderer.on('devPort', async event => {
    await windowLoaded
  
    window.postMessage('devPort', '*', event.ports)
  })  

// Receive sattelite or main message from captchaSolver
ipcRenderer.on('message', async (event, args) => {
  await windowLoaded

  switch (args.type) {
    case 'main':
    case 'satellite':
      window.postMessage({ ...args, action: 'solverWindowType' }, '*')
      break
    case 'update':
      window.postMessage({ ...args, action: 'updateWindow' }, '*')
      break
    case 'focus':
      window.postMessage({ ...args, action: 'focusTab' }, '*')
      break
    case 'loginStatus':
      window.postMessage({ ...args, action: 'loginStatus' }, '*')
    default:
      break
  }
})

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('store', {
  get: key => store.get(key),
  set: (key, data) => store.set(key, data),
  import: {
    billing: async () => await ipcRenderer.invoke('store', { action: 'importBilling' }),
  },
  export: {
    billing: async () => await ipcRenderer.invoke('store', { action: 'exportBilling' }),
  },
})

contextBridge.exposeInMainWorld('api', {
  login: licenseKey => ipcRenderer.send('authenticate', { licenseKey }),
  request: (params, callback) => ipcRenderer.invoke('request', params).then(({ err, data }) => callback(err, data)),
})

contextBridge.exposeInMainWorld('solver', {
  createNewSolverWindow: async ({ proxy, autoClickCaptcha }) => await ipcRenderer.invoke('solver', { action: 'createNewSolverWindow', proxy, autoClickCaptcha }),
  createNewGoogleAccountSession: async ({ solverId, name }) => await ipcRenderer.invoke('solver', { action: 'createNewGoogleAccountSession', solverId, name }),
  createNewSatelliteSolver: async ({ solverId }) => await ipcRenderer.invoke('solver', { action: 'createNewSatelliteSolver', solverId }),
  returnSatelliteSolver: async ({ solverId }) => await ipcRenderer.invoke('solver', { action: 'returnSatelliteSolver', solverId }),
  deleteSolver: async ({ solverId }) => await ipcRenderer.invoke('solver', { action: 'deleteSolver', solverId }),
  deleteSession: async ({ solverId, sessionId }) => await ipcRenderer.invoke('solver', { action: 'deleteSession', solverId, sessionId }),
  rotateProxy: async ({ solverId, proxy }) => await ipcRenderer.invoke('solver', { action: 'rotateProxy', solverId, proxy }),
  updateSession: async ({ solverId, sessionId }) => await ipcRenderer.invoke('solver', { action: 'updateSession', solverId, sessionId }),
  importSessions: async ({ sessions }) => await ipcRenderer.invoke('solver', { action: 'importSessions', sessions }),
  importSolvers: async ({ solvers }) => await ipcRenderer.invoke('solver', { action: 'importSolvers', solvers }),
  exportSessions: async () => await ipcRenderer.invoke('solver', { action: 'exportSessions' }),
  exportSolvers: async () => await ipcRenderer.invoke('solver', { action: 'exportSolvers' }),
  exportWindows: async () => await ipcRenderer.invoke('solver', { action: 'exportWindows' }),
  testSolver: async ({ solverId }) => await ipcRenderer.invoke('solver', { action: 'testSolver', solverId }),
  refreshSolver: async ({ solverId }) => await ipcRenderer.invoke('solver', { action: 'refreshSolver', solverId }),
  setFrontSolver: async ({ solverId }) => await ipcRenderer.invoke('solver', { action: 'setFrontSolver', solverId }),
})

contextBridge.exposeInMainWorld('taskManager', {
  getSites: async () => await ipcRenderer.invoke('taskManager', { action: 'getSites' }),
  createTask: async (taskProps, callback) =>
    await ipcRenderer
      .invoke('taskManager', {
        action: 'createTask',
        taskProps,
      })
      .then(result => callback(result)),
  startTask: async ({ id }) => await ipcRenderer.invoke('taskManager', { action: 'startTask', id }),
  deleteTask: async ({ id }) => await ipcRenderer.invoke('taskManager', { action: 'deleteTask', id }),
  stopTask: async ({ id }) => await ipcRenderer.invoke('taskManager', { action: 'stopTask', id }),
  editTask: async ({id, editProps}) => await ipcRenderer.invoke('taskManager', { action: 'editTask', id, editProps }),
  editAllTasks: async ({editProps}) => await ipcRenderer.invoke('taskManager', { action: 'editAllTasks', editProps }),
  proxyManager: {
    getProxies: async () => await ipcRenderer.invoke('taskManager', { action: 'getProxies' }),
    createGroup: async ({ id, group_name }) => await ipcRenderer.invoke('taskManager', { action: 'createProxyGroup', id, group_name }),
    deleteGroup: async ({ id }) => await ipcRenderer.invoke('taskManager', { action: 'deleteProxyGroup', id }),
    deleteProxy: async ({ id, proxy }) => await ipcRenderer.invoke('taskManager', { action: 'deleteProxy', id, proxy }),
    addProxy: async ({ id, proxy }) => await ipcRenderer.invoke('taskManager', { action: 'createProxy', id, proxy }),
  },
})

contextBridge.exposeInMainWorld('windowControls', {
  minimize: () => ipcRenderer.send('windowControl', { action: 'minimize' }),
  close: () => ipcRenderer.send('windowControl', { action: 'close' }),
  quit: () => ipcRenderer.send('windowControl', { action: 'quit' }),
  hide: () => ipcRenderer.send('windowControl', { action: 'hide' }),
  showSolver: () => ipcRenderer.send('windowControl', { action: 'showSolver' }),
})

const os = require('os')
const path = require('path')
const ProxyManager = require('./dist/task-manager/proxy_manager.js')
const SharedResourceManager = require('./dist/task-manager/shared_resource_manager.js')
const Webhook = require('./dist/task-manager/webhook.js');

const { authenticate, request, createLiveVariableCallback, handleStoreCallback, setWSMessageRouterWorkerThreadCallback, sendAnalytic } = require('./dist/main/connections')
const { processCallbackRouter, handleCallback } = require('./dist/main/routers')(process)
const { Worker, SHARE_ENV, BroadcastChannel } = require('worker_threads')
const { CREATE_TASK, START_TASK, STOP_TASK, EDIT_TASK, EDIT_ALL_TASKS, DELETE_TASK, SEND_STATUS_MESSAGE, LIVE_VARIABLE_UPDATE, WEBSOCKET, SOLVE_CAPTCHA, OPEN_BROWSER, REQUEST_NEW_PROXY, GET_TASKS, ORDER_CALLBACK, STOP_TASK_NO_SEND_STATUS, SEND_ANALYTIC, GET_SHARED_RESOURCE, SET_PRIORITY_SHARED_RESOURCE, WORKER_THREAD_INITIALIZATION } = require('./worker.channels.js')
const { v4: uuidv4 } = require('uuid');

const solveCaptcha = processCallbackRouter('solveCaptcha')
const openBrowser = processCallbackRouter('openBrowser')

/**
 * Contains workers, their index, whether or not they've been initialized, their initialization promise and a function to resolve their initialization promise
 * 
 * @type {Array.<{worker: Object, index: number, initialized: boolean, promise: Promise, res: Function}>}
 */
const taskManagerWorkerPool = [],
      mainProcessBroadcastChannels = {}

let statusUpdatesQueue = {},
    createTaskWorkerThreadIndex = 0,
    proxyManager = undefined,
    sharedResourceManager = undefined

/**
 * Stored orders
 * 
 * @type {Array.<Object}}
 */
const orders = []

  /**
   * Function to be called upon finish of a task, logs the success, handles profile and group limits
   *
   * @function orderCallback
   *
   * @param {Object} args - Arguments for an order callback
   * @param {Object} args.order 
   * @param {'success' | 'decline'} args.order.type - The type of order
   * @param {string} args.order.id - Order ID of the item brought
   * @param {string} args.order.profile - Name of the profile used to buy the item
   * @param {string} args.order.proxy - Name of the proxy group used to buy the item
   * @param {string} args.order.email - Email of the profile used to buy item
   * @param {number} args.order.price - Price of the item brought
   * @param {string} args.order.size - Size of the item brought
   * @param {string} args.order.product - ID / SKU / PID / URL of the item brought
   * @param {string} args.order.name - Name of the item brought
   * @param {string} args.order.image - Image of the item brought
   * @param {Object} args.taskId - Id of the task calling this callback
   */
const orderCallback = async ({ order, taskId }) => {
    try {
        const tasks = await getAllWorkerThreadTasks(),
              task = tasks.find(({id}) => taskId === id)

        if (order.type && order.type === 'success') {
            orders.push({ ...order, group: task.group })
        }

        /**
         * @TODO
         * 
         * Could reduce amount of IPC here by sending an array of task ids to be stopped rather than an IPC event for each task id
         */
        mainProcessBroadcastChannels[STOP_TASK_NO_SEND_STATUS].postMessage({params: {id: taskId}})

        if (task.profile.single_checkout && order.type === 'success') {
            tasks.forEach(_task => {
                if (_task.profile.id === task.profile.id) {
                    /**
                     * @TODO
                     * 
                     * Could reduce amount of IPC here by sending an array of task ids to be stopped rather than an IPC event for each task id
                     */
                    mainProcessBroadcastChannels[STOP_TASK_NO_SEND_STATUS].postMessage({params: {id: _task.id}})
                    statusUpdatesQueue[_task.id] = { msg: 'Profile Limit Reached', status: 'error', taskUpdates: undefined }
                }
            })    
        }

        if (task.group.checkout_limit && orders.filter(_order => _order.type === 'success' && _order.group.id === task.group.id).length >= task.group.checkout_limit_count) {
            tasks.forEach(_task => {
                if (_task.group.id === task.group.id) {
                    /**
                     * @TODO
                     * 
                     * Could reduce amount of IPC here by sending an array of task ids to be stopped rather than an IPC event for each task id
                     */
                    mainProcessBroadcastChannels[STOP_TASK_NO_SEND_STATUS].postMessage({params: {id: _task.id}})
                    statusUpdatesQueue[_task.id] = { msg: 'Group Limit Reached', status: 'error', taskUpdates: undefined }
                }
            })
        }

        if (Object.keys(statusUpdatesQueue).length) sendStatus()

        try {
            const webhook = new Webhook({parent: task})
                  webhook.handleWebhook(order)
        } catch (err) {
            console.error(`Error sending webhook in order callback for task id ${id}, Error: ${err}`)
        }

        /*
        insert success api request here
        */

    } catch (err) {
      console.error(`Error executing order callback for task id ${id}, Error: ${err}`)
    }
  }

/**
 * @type {Array.<{id, callback}>}
 */
 const workerThreadCallbacks = []

/**
 * Initializes IPC broadcast channels for specific data between worker threads and the main process
 */
const initializeBroadcastChannels = () => {
    try {
        mainProcessBroadcastChannels.CREATE_TASK = new BroadcastChannel(CREATE_TASK)
        mainProcessBroadcastChannels.START_TASK = new BroadcastChannel(START_TASK)
        mainProcessBroadcastChannels.STOP_TASK = new BroadcastChannel(STOP_TASK)
        mainProcessBroadcastChannels.EDIT_TASK = new BroadcastChannel(EDIT_TASK)
        mainProcessBroadcastChannels.EDIT_ALL_TASKS = new BroadcastChannel(EDIT_ALL_TASKS)
        mainProcessBroadcastChannels.DELETE_TASK = new BroadcastChannel(DELETE_TASK)
        mainProcessBroadcastChannels.SEND_STATUS_MESSAGE = new BroadcastChannel(SEND_STATUS_MESSAGE)
        mainProcessBroadcastChannels.LIVE_VARIABLE_UPDATE = new BroadcastChannel(LIVE_VARIABLE_UPDATE)
        mainProcessBroadcastChannels.WEBSOCKET = new BroadcastChannel(WEBSOCKET)
        mainProcessBroadcastChannels.SOLVE_CAPTCHA = new BroadcastChannel(SOLVE_CAPTCHA)
        mainProcessBroadcastChannels.OPEN_BROWSER = new BroadcastChannel(OPEN_BROWSER)
        mainProcessBroadcastChannels.REQUEST_NEW_PROXY = new BroadcastChannel(REQUEST_NEW_PROXY)
        mainProcessBroadcastChannels.GET_TASKS = new BroadcastChannel(GET_TASKS)
        mainProcessBroadcastChannels.ORDER_CALLBACK = new BroadcastChannel(ORDER_CALLBACK)
        mainProcessBroadcastChannels.STOP_TASK_NO_SEND_STATUS = new BroadcastChannel(STOP_TASK_NO_SEND_STATUS)
        mainProcessBroadcastChannels.SEND_ANALYTIC = new BroadcastChannel(SEND_ANALYTIC)
        mainProcessBroadcastChannels.GET_SHARED_RESOURCE = new BroadcastChannel(GET_SHARED_RESOURCE)
        mainProcessBroadcastChannels.SET_PRIORITY_SHARED_RESOURCE = new BroadcastChannel(SET_PRIORITY_SHARED_RESOURCE)
        mainProcessBroadcastChannels.WORKER_THREAD_INITIALIZATION = new BroadcastChannel(WORKER_THREAD_INITIALIZATION)
    } catch (err) {
        console.error('Error initializing broadcast channels, error: ', err)
        return err
    }
}

/**
 * @callback broadcastChannelListenerCallback
 * @param {any} MessageEvent - The message emitted from the broadcast channel
 */

/**
 *  * Registers a listener on a broadcast channel, to receive message events from worker threads
 * 
 * @param {string} channel - The name of the broadcast channel to register a listener upon
 * @param {broadcastChannelListenerCallback} handler - The handler for the broadcast channel
 */
const registerBroadcastChannelListener = (type, handler) => {
    mainProcessBroadcastChannels[type].onmessage = handler
    mainProcessBroadcastChannels[type].onmessageerror = () => console.error('Message error occured in broadcast channel handler for: ', type)
}

/**
 * Initializes various broadcast channel listeners
 */
const initializeBroadcastChannelListeners = () => {
    registerBroadcastChannelListener(SEND_STATUS_MESSAGE, ({data: {params}}) => {
        try {
            // Status message received from task in callback parameters, update status on GUI
            const {id: taskId, msg, status, taskUpdates} = params
            statusUpdatesQueue[taskId] = { msg, status, taskUpdates }
            
            if (Object.keys(statusUpdatesQueue).length > 80) sendStatus()
        } catch (err) {
            console.error(`Error in broadcast channel listener for channel name "${SEND_STATUS_MESSAGE}", Error: ${err}`)
        }
    })

    // Handle requests to solveCaptcha and openBrowser from worker threads and respond with results
    registerBroadcastChannelListener(SOLVE_CAPTCHA, async ({data: {type, id, params}}) => {
        try {
            if (type === 'request') {
                const data = await solveCaptcha(params)
                mainProcessBroadcastChannels[SOLVE_CAPTCHA].postMessage({type: 'response', id, params: data})    
            }
        } catch (err) {
            console.error(`Error in broadcast channel listener for channel name "${SOLVE_CAPTCHA}", Error: ${err}`)
        }
    })

    registerBroadcastChannelListener(OPEN_BROWSER, async ({data: {type, id, params}}) => {
        try {
            if (type === 'request') {
                const data = await openBrowser(params)
                mainProcessBroadcastChannels[OPEN_BROWSER].postMessage({type: 'response', id, params: data})    
            }    
        } catch (err) {
            console.error(`Error in broadcast channel listener for channel name "${OPEN_BROWSER}", Error: ${err}`)
        }
    })

    // Route worker thread responses for createTask to it's given callback
    registerBroadcastChannelListener(CREATE_TASK, ({data: {type, id, params}}) => {
        try {
            if (type === 'response') workerThreadHandleCallback({type, id, params})
        } catch (err) {
            console.error(`Error in broadcast channel listener for channel name "${CREATE_TASK}", Error: ${err}`)
        }
    })

    // Handle a new proxy request from a worker thread by requesting a new proxy from the centralized
    // proxy manager in the processRunner process, respond with the newly requested proxy to be set
    // to the task's runArgs.proxy.current variable in the worker thread
    registerBroadcastChannelListener(REQUEST_NEW_PROXY, async ({data: {type, id, params}}) => {
        try {
            if (type === 'request') {
                const data = await proxyManager.requestNewProxy({id: params.id})
                mainProcessBroadcastChannels[REQUEST_NEW_PROXY].postMessage({type: 'response', id, params: data})
            }    
        } catch (err) {
            console.error(`Error in broadcast channel listener for channel name "${REQUEST_NEW_PROXY}", Error: ${err}`)
        }
    })

    // Route a get tasks response from a worker thread to it's given callback
    registerBroadcastChannelListener(GET_TASKS, ({data: {type, id, params}}) => {
        try {
            if (type === 'response') workerThreadHandleCallback({type, id, params})
        } catch (err) {
            console.error(`Error in broadcast channel listener for channel name "${GET_TASKS}", Error: ${err}`)
        }
    })    

    // Handle order callbacks from worker threads to centralized order callback handler
    registerBroadcastChannelListener(ORDER_CALLBACK, ({data: {params}}) => {
        try {
            orderCallback(params)
        } catch (err) {
            console.error(`Error in broadcast channel listener for channel name "${ORDER_CALLBACK}", Error: ${err}`)
        }
    })

    // Handle analytics from a worker thread task, send the analytic through the websocket
    registerBroadcastChannelListener(SEND_ANALYTIC, ({data: {params}}) => {
        try {
            sendAnalytic(params.type, params.args)
        } catch (err) {
            console.error(`Error in broadcast channel listener for channel name "${SEND_ANALYTIC}", Error: ${err}`)
        }
    })

    registerBroadcastChannelListener(GET_SHARED_RESOURCE, async ({data: {type, id, params}}) => {
        try {
            if (type === 'request') {
                const data = await sharedResourceManager.getSharedResource(params)
                mainProcessBroadcastChannels[GET_SHARED_RESOURCE].postMessage({type: 'response', id, params: data})
            }
        } catch (err) {
            console.error(`Error in broadcast channel listener for channel name "${GET_SHARED_RESOURCE}", Error: ${err}`)
        }
    })

    registerBroadcastChannelListener(SET_PRIORITY_SHARED_RESOURCE, ({data: {params}}) => {
        try {
            sharedResourceManager.setPrioritySharedResource(params)
        } catch (err) {
            console.error(`Error in broadcast channel listener for channel name "${GET_SHARED_RESOURCE}", Error: ${err}`)
        }
    })

    registerBroadcastChannelListener(WORKER_THREAD_INITIALIZATION, ({data: {params}}) => {
        try {
            // Resolve initialization promise, sets worker.initialized to true
            taskManagerWorkerPool.find(({index}) => index === params.workerIndex)?.res()
        } catch (err) {
            console.error(`Error in broadcast channel listener for channel name "${WORKER_THREAD_INITIALIZATION}", Error: ${err}`)
        }
    })
}

/**
 * Spawns a task manager worker thread
 */
const spawnTaskManagerWorker = (i) => {
    try {
        // Create a new worker thread, the SHARED_ENV variable ports this process's environment variables into the worker thread's
        const taskManagerWorkerThread = new Worker(path.join(__dirname, 'main.worker.js'), {workerData: {workerIndex: i}, env: SHARE_ENV})

        taskManagerWorkerThread.on('error', err => console.error(`[ERROR] Worker thread index #${i} encountered an error, Error: ${err}`))
        taskManagerWorkerThread.on('exit', code => console.error(`[ERROR] Worker thread index #${i} exited, Exit code: ${code}`))

        let initialized, res
        let promise = new Promise(_res => (res = _res)).then(() => initialized = true)

        taskManagerWorkerPool.push({
            worker: taskManagerWorkerThread,
            index: i,
            initialized,
            promise,
            res
        })
    } catch (err) {
        console.error('Error spawning task manager worker, error: ', err)
        return err
    }
}

/***
 * Initializes a pool of task manager workers based upon the CPU count of the processor
 * 
 * @returns {boolean} Whether or not initializing the pool of task managers was successful
 */
const initializeTaskManagerWorkerPool = () => {
    try {
        // Initialize the IPC broadcast channels between worker threads and the main process
        initializeBroadcastChannels()

        // Initialize the listeners for IPC sent to the main process from worker threads
        initializeBroadcastChannelListeners()

        // Get the number of available logical processors, and spawn (n - 1) worker threads, as the main thread should have a dedicated thread seperate from the worker threads
        const cores = os.cpus()
        for (let i = 0; i < cores.length; i++) {
            spawnTaskManagerWorker(i)
        }

        return true
    } catch (err) {
        console.error('Error initializing task manager worker pool, error: ', err)
        return false
    }
}

let taskCache = undefined, // Cache of all tasks from all worker threads
    lastFetched = undefined // The last time the task cache was fetched
    cacheBeingFetched = false // Whether or not the task cache is currently being fetched
    awaitCacheResolves = [] // All await cache promise resolution functions

const cacheTimeout = 2500 // Timeout of cache in ms between getAllWorkerThread calls

const awaitCachePromise = () => 
    new Promise((resolve, reject) => {
        if (!cacheBeingFetched) return resolve()
        else awaitCacheResolves.push(resolve)
    })

/**
 * Fetches all tasks from all worker threads
 */
const getAllWorkerThreadTasks = () => 
    new Promise(async (resolve, reject) => {
        try {
            if (cacheBeingFetched || (taskCache && lastFetched && Date.now() - lastFetched < cacheTimeout)) {
                await awaitCachePromise()
                return resolve(taskCache)
            }
            else {
                cacheBeingFetched = true

                const tasks = []
                for (let i = 0; i < taskManagerWorkerPool.length; i++) {
                    // Get tasks from each worker thread, based off it's worker index set upon initialization
                    const _tasks = await getTasks({workerIndex: taskManagerWorkerPool[i].index})
                    tasks.push(..._tasks)
                }

                taskCache = tasks
                lastFetched = Date.now()

                awaitCacheResolves.forEach(resolve => resolve())
                cacheBeingFetched = false
                awaitCacheResolves = []

                return resolve(tasks)
            }
        } catch (err) {
            console.error('Error getting all worker thread tasks, error: ', err)
        }
    })


/**
 * Initializes the centralized proxy manager
 */
const initializeProxyManager = () => {
    try {
        proxyManager = new ProxyManager(getAllWorkerThreadTasks)
    } catch (err) {
        console.error('Error initializing proxy manager, error: ', err)
    }
}

const initializeSharedResourceManager = () => {
    try {
        sharedResourceManager = new SharedResourceManager(solveCaptcha, openBrowser)
    } catch (err) {
        console.error('Error initializing shared resource manager, error: ', err)
    }
}

/**
 * Routes 2-way request-response operations between the processRunner and a worker thread
 */
 const workerThreadCallbackRouter = action => params =>
    new Promise((resolve, reject) => {
        const id = uuidv4()

        workerThreadCallbacks.push({
            id,
            callback: (err, data) => {
                if (err) return reject(err)
                return resolve(data)
            }
        })

        if (mainProcessBroadcastChannels[action]) mainProcessBroadcastChannels[action].postMessage({type: 'request', id, params})
        else console.error(`Error sending worker thread callback, broadcast channel "${type}" does not exist`)
})

const workerThreadHandleCallback = data => {
    const i = workerThreadCallbacks.findIndex(({id}) => id === data.id)
    if (i < 0) return

    workerThreadCallbacks[i].callback(null, data.params)
    workerThreadCallbacks.splice(i, 1)
}

const sendStatus = () => {
    const statusUpdates = Object.keys(statusUpdatesQueue).map(id => {
      const { msg, status, taskUpdates } = statusUpdatesQueue[id]
  
      return { id, msg, status, taskUpdates }
    })
  
    process.send({
      action: 'sendStatusMessage',
      params: { statusUpdates },
    })
  
    statusUpdatesQueue = {}
}

const createTask = workerThreadCallbackRouter(CREATE_TASK)
const getTasks = workerThreadCallbackRouter(GET_TASKS)

initializeProxyManager()
initializeSharedResourceManager()
initializeTaskManagerWorkerPool()

// Route websocket messages from the websocket in processRunner to every worker thread
setWSMessageRouterWorkerThreadCallback(arg => {
    mainProcessBroadcastChannels[WEBSOCKET].postMessage({params: arg})
})

// Upon a live variable update, send the updated live variables to every worker thread
createLiveVariableCallback(liveVariables => {
    mainProcessBroadcastChannels[LIVE_VARIABLE_UPDATE].postMessage({params: liveVariables})
})

// Set an interval to send status messages whether or not the length of the queue is large enough at a given time
setInterval(() => {
  if (Object.keys(statusUpdatesQueue).length > 0) sendStatus()
}, 50)

/**
 * Message Router & Handler
 */
process.on('message', async ({ action, id, params, event }) => {
  // console.log('request from parent process', { action, id, params, event })

  try {
    switch (action) {
      case 'request':
        {
          // console.log('request from parent', params)
          try {
            request(params, (err, data) => {
              if (err) process.send({ action: 'response', id, params: { err }, event })
              else process.send({ action: 'response', id, params: { data }, event })
            })
          } catch (err) {
            console.error('err:', err)
          }
        }
        break
      case 'openBrowserReturn':
      case 'solveCaptchaReturn':
        handleCallback(id, params)
        break
      case 'authenticate':
        authenticate(params.licenseKey)
          .then(() => process.send({ action: 'login', id, params: { success: true } }))
          .catch(() => process.send({ action: 'login', id, params: { success: false } }))
        break
      case 'createTask':
        try {
          // Create tasks equally between worker threads by incrementing the current create task worker thread index
          createTask({taskProps: params.taskProps, workerIndex: createTaskWorkerThreadIndex++}).then(data => {
              process.send({ action: 'createTask', id, params: { data }, event })
            })

          if (createTaskWorkerThreadIndex === taskManagerWorkerPool.length) createTaskWorkerThreadIndex = 0
        } catch (err) {
          process.send({ action: 'createTask', id, params: { err: err.message }, event })
        }
        break
      case 'startTask':
        mainProcessBroadcastChannels[START_TASK].postMessage({params})
        break
      case 'stopTask':
        mainProcessBroadcastChannels[STOP_TASK].postMessage({params})
        break
      case 'deleteTask':
        mainProcessBroadcastChannels[DELETE_TASK].postMessage({params})
        break
      case 'editTask':
        mainProcessBroadcastChannels[EDIT_TASK].postMessage({params})
        break   
      case 'editAllTasks':
        mainProcessBroadcastChannels[EDIT_ALL_TASKS].postMessage({params})
        break
      case 'getProxies':
        {
          try {
            const data = JSON.parse(JSON.stringify(proxyManager.proxies.groups))
            process.send({ action: 'getProxies', id, params: { data }, event })
          } catch (err) {
            process.send({ action: 'getProxies', id, params: { err: err.message }, event })
          }
        }
        break
      case 'importProxyGroups':
        proxyManager.importGroups({ groups: params.groups })
        break
      case 'createProxyGroup':
        proxyManager.createGroup({ id: params.id, group_name: params.group_name })
        break
      case 'deleteProxyGroup':
        await proxyManager.deleteGroup({ id: params.id })
        break
      case 'deleteProxy':
        await proxyManager.deleteProxy({ id: params.id, proxy: params.proxy })
        break
      case 'addProxy':
        proxyManager.addProxy({ id: params.id, proxy: params.proxy })
        break
      case 'store':
        handleStoreCallback(id, { data: params.data })
        break
      default:
        break
    }
  } catch (err) {
    console.error('[Child process] Error in router', err)
  }
})

// Await all worker threads to be initialized
Promise.all(taskManagerWorkerPool.reduce((acc, cur) => (acc.push(cur.promise), acc), [])).then(() => {
    // Initilization callback to parent process
    process.send({action: 'initialized'})    
}).catch(err => {
    console.error(`Error initializing worker threads, Error: ${err}`)
})
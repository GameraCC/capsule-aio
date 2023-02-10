const lodash = require('lodash')
const TaskManager = require('./dist/task-manager')

const { BroadcastChannel, workerData } = require('worker_threads')
const { request, getInitialLiveVariables, getNokamai, getPixel, getInitialFingerprint, WSMessageRouterWorkerThread, createLiveVariableCallback } = require('./dist/main/connections')
const { CREATE_TASK, START_TASK, STOP_TASK, EDIT_TASK, EDIT_ALL_TASKS, DELETE_TASK, SEND_STATUS_MESSAGE , LIVE_VARIABLE_UPDATE, WEBSOCKET, SOLVE_CAPTCHA, OPEN_BROWSER, REQUEST_NEW_PROXY, GET_TASKS, ORDER_CALLBACK, STOP_TASK_NO_SEND_STATUS, SEND_ANALYTIC, GET_SHARED_RESOURCE, SET_PRIORITY_SHARED_RESOURCE, WORKER_THREAD_INITIALIZATION } = require('./worker.channels.js')
const { v4: uuidv4 } = require('uuid')

let taskManager = undefined
const workerThreadBroadcastChannels = {}

/**
 * @type {Array.<{id, callback}>}
 */
const processRunnerCallbacks = []

createLiveVariableCallback((liveVariables) => {
    /**
     * Upon receiving new live variables from an update in the live variable database
     * being sent to the websocket in the main process, and the websocket braodcast channel
     * receiving the live variables, update the values of the live variables through the
     * taskManager's onliveVariableUpdate event
     */
    liveVariables.forEach(update => {
        const [[key, value]] = Object.entries(update)
        taskManager.onLiveVariableUpdate(key, value)
    })
})

/**
 * Initializes IPC broadcast channels for specific data between the main process and this worker thread
 */
const initializeBroadcastChannels = () => {
    workerThreadBroadcastChannels.CREATE_TASK = new BroadcastChannel(CREATE_TASK)
    workerThreadBroadcastChannels.START_TASK = new BroadcastChannel(START_TASK)
    workerThreadBroadcastChannels.STOP_TASK = new BroadcastChannel(STOP_TASK)
    workerThreadBroadcastChannels.EDIT_TASK = new BroadcastChannel(EDIT_TASK)
    workerThreadBroadcastChannels.EDIT_ALL_TASKS = new BroadcastChannel(EDIT_ALL_TASKS)
    workerThreadBroadcastChannels.DELETE_TASK = new BroadcastChannel(DELETE_TASK)
    workerThreadBroadcastChannels.SEND_STATUS_MESSAGE = new BroadcastChannel(SEND_STATUS_MESSAGE)
    workerThreadBroadcastChannels.LIVE_VARIABLE_UPDATE = new BroadcastChannel(LIVE_VARIABLE_UPDATE)
    workerThreadBroadcastChannels.WEBSOCKET = new BroadcastChannel(WEBSOCKET)
    workerThreadBroadcastChannels.SOLVE_CAPTCHA = new BroadcastChannel(SOLVE_CAPTCHA)
    workerThreadBroadcastChannels.OPEN_BROWSER = new BroadcastChannel(OPEN_BROWSER)
    workerThreadBroadcastChannels.REQUEST_NEW_PROXY = new BroadcastChannel(REQUEST_NEW_PROXY)
    workerThreadBroadcastChannels.GET_TASKS = new BroadcastChannel(GET_TASKS)
    workerThreadBroadcastChannels.ORDER_CALLBACK = new BroadcastChannel(ORDER_CALLBACK)
    workerThreadBroadcastChannels.STOP_TASK_NO_SEND_STATUS = new BroadcastChannel(STOP_TASK_NO_SEND_STATUS)
    workerThreadBroadcastChannels.SEND_ANALYTIC = new BroadcastChannel(SEND_ANALYTIC)
    workerThreadBroadcastChannels.GET_SHARED_RESOURCE = new BroadcastChannel(GET_SHARED_RESOURCE)
    workerThreadBroadcastChannels.SET_PRIORITY_SHARED_RESOURCE = new BroadcastChannel(SET_PRIORITY_SHARED_RESOURCE)
    workerThreadBroadcastChannels.WORKER_THREAD_INITIALIZATION = new BroadcastChannel(WORKER_THREAD_INITIALIZATION)
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
    workerThreadBroadcastChannels[type].onmessage = handler
    workerThreadBroadcastChannels[type].onmessageerror = () => console.error('Message error occured in broadcast channel handler for: ', type)
}

/**
 * Filters object properties for unserializable types as defined by the structured clone algorithm
 * 
 * @param {Object} toFilter - An object whom's properties should be filtered
 * @returns {Object} - The deep cloned, filtered object
 */
 const filterUnserializableProperties = (object) => {
    // Create a deep clone of the object
    const clonedObject = lodash.cloneDeep(object)
    const supportedStructuredClonePrimitiveTypes = ['boolean', 'undefined', 'number', 'bigint', 'string']

    // ArrayBufferView, Blob, File, FileList, ImageBitmap, ImageData not included as there is no node implementation of these classes.
    // The Object class is not included, as there is other handling to detect plain object types
    const supportedStructuredCloneInstanceTypes = [Boolean, String, Date, RegExp, ArrayBuffer, Array, Map, Set]

    // Object references stored to check for circular properties
    const references = []
    
    const filter = (_object) => {
        Object.keys(_object).forEach(key => {
            const type = typeof _object[key]
            if (supportedStructuredClonePrimitiveTypes.includes(type) || type === null) return
            else if (type === 'object') {
                // Check if object is a plain object
                if (Object.prototype.toString.call(_object[key]) === '[object Object]') {
                    const prototype = Object.getPrototypeOf(_object[key]);
                    if (prototype === null || prototype === Object.prototype) {
                        if (Object.keys(_object).length) {
                            for (let i = 0; i < references.length; i++) {
                                // If the object is a circular reference, don't reiterate over it's properties
                                if (references[i] === _object[key]) return
                            }

                            references.push(_object[key])
                            filter(_object[key])
                            return
                        } else return
                    }
                }
    
                for (let i = 0; i < supportedStructuredCloneInstanceTypes.length; i++) {
                    if (_object[key] instanceof supportedStructuredCloneInstanceTypes[i]) return
                }
    
                delete _object[key]
            } else delete _object[key]
        })    
    }

    filter(clonedObject)

    return clonedObject
}

/**
 * Initializes various broadcast channel listeners
 */
const initializeBroadcastChannelListeners = () => {

    registerBroadcastChannelListener(START_TASK, ({data: {params}}) => {
        try {
            // If task with given ID is present in the task manager tasks array, start the task
            taskManager.tasks.find(({id}) => id === params.id)?.startTaskGui()
        } catch (err) {
            console.error(`Error in broadcast channel listener for channel name "${START_TASK}", Error: ${err}`)
        }
    })

    registerBroadcastChannelListener(STOP_TASK, ({data: {params}}) => {
        try {
            // If task with given ID is present in the task manager tasks array, stop the task with the gui stop task method
            taskManager.tasks.find(({id}) => id === params.id)?.stopTaskGui()
        } catch (err) {
            console.error(`Error in broadcast channel listener for channel name "${STOP_TASK}", Error: ${err}`)
        }
    })

    registerBroadcastChannelListener(STOP_TASK_NO_SEND_STATUS, ({data: {params}}) => {
        try {
            // If task with given ID is present in the task manager tasks array, stop the task with the default stop task method
            taskManager.tasks.find(({id}) => id === params.id)?.stopTask()
        } catch (err) {
            console.error(`Error in broadcast channel listener for channel name "${STOP_TASK_NO_SEND_STATUS}", Error: ${err}`)
        }
    })

    registerBroadcastChannelListener(EDIT_TASK, ({data: {params}}) => {
        try {
           taskManager.tasks.find(({id}) => id === params.id)?.editTask(params.editProps)
        } catch (err) {
            console.error(`Error in broadcast channel listener for channel name "${EDIT_TASK}", Error: ${err}`)
        }
    })

    registerBroadcastChannelListener(EDIT_ALL_TASKS, ({data: {params}}) => {
        try {
           for (let i = 0; i < taskManager.tasks.length; i++) {
              taskManager.tasks[i].editTask(params.editProps)
           }
        } catch (err) {
            console.error(`Error in broadcast channel listener for channel name "${EDIT_TASK}", Error: ${err}`)
        }
    })

    registerBroadcastChannelListener(DELETE_TASK, ({data: {params}}) => {
        try {
             const i = taskManager.tasks.findIndex(({id}) => id === params.id)
             if (i >= 0) taskManager.tasks.splice(i, 1)
        } catch (err) {
            console.error(`Error in broadcast channel listener for channel name "${DELETE_TASK}", Error: ${err}`)
        }
    })

    registerBroadcastChannelListener(WEBSOCKET, ({data: {params}}) => {
        try {
            // Route websocket messages from the websocket in processRunner, to the websocket router
            // in the worker thread
            WSMessageRouterWorkerThread(params)
        } catch (err) {
            console.error(`Error in broadcast channel listener for channel name "${WEBSOCKET}", Error: ${err}`)
        }
    })

    registerBroadcastChannelListener(CREATE_TASK, ({data: {type, id, params}}) => {
        try {
            // Check if the create task event is for the given worker thread, if so create the task in this worker thread and send the result to the processRunner process
            if (type === 'request' && params.workerIndex === workerData.workerIndex) {
                taskManager.createTask(params.taskProps, data => workerThreadBroadcastChannels[CREATE_TASK].postMessage({type: 'response', id, params: data}))
            }
        } catch (err) {
            console.error(`Error in broadcast channel listener for channel name "${CREATE_TASK}", Error: ${err}`)
        }
    })

    // Route processRunner responses for solveCaptcha and openBrowser to their given callbacks
    registerBroadcastChannelListener(SOLVE_CAPTCHA, ({data: {type, id, params}}) => {
        try {
            if (type === 'response') handleProcessRunnerCallback({type, id, params})
        } catch (err) {
            console.error(`Error in broadcast channel listener for channel name "${SOLVE_CAPTCHA}", Error: ${err}`)
        }
    })

    registerBroadcastChannelListener(OPEN_BROWSER, ({data: {type, id, params}}) => {
        try {
            if (type === 'response') handleProcessRunnerCallback({type, id, params})
        } catch (err) {
            console.error(`Error in broadcast channel listener for channel name "${OPEN_BROWSER}", Error: ${err}`)
        }
    })

    registerBroadcastChannelListener(GET_TASKS, ({data: {type, id, params}}) => {
        try {
            // Check if the get tasks event is for the given worker thread, if so get the worker thread's current tasks and send them back to the processRunner process
            if (type === 'request' && params.workerIndex === workerData.workerIndex) {

                const data = taskManager.tasks.map(task => ({
                    id: task.id,
                    state: {
                        started: task.state.started,
                        stopped: task.state.stopped
                    },
                    runArgs: {
                        proxy: task.runArgs.proxy
                    }
                    // id: task.id,
                    // group: task.group,
                    // state: filterUnserializableProperties(task.state),
                    // profile: task.profile,
                    // runArgs: task.runArgs,
                    // productArgs: task.productArgs,
                    // loginArgs: task.loginArgs,
                    // webhookArgs: task.webhookArgs,
                    // variables: filterUnserializableProperties(task.variables)
                }))
                
                workerThreadBroadcastChannels[GET_TASKS].postMessage({type: 'response', id, params: data})
            }
        } catch (err) {
            console.error(`Error in broadcast channel listener for channel name "${GET_TASKS}", Error: ${err}`)
        }
    })

    registerBroadcastChannelListener(REQUEST_NEW_PROXY, ({data: {type, id, params}}) => {
        try {
            if (type === 'response') handleProcessRunnerCallback({type, id, params})
        } catch (err) {
            console.error(`Error in broadcast channel listener for channel name "${REQUEST_NEW_PROXY}", Error: ${err}`)
        }
    })   

    registerBroadcastChannelListener(GET_SHARED_RESOURCE, ({data: {type, id, params}}) => {
        try {
            if (type === 'response') handleProcessRunnerCallback({type, id, params})
        } catch (err) {
            console.error(`Error in broadcast channel listener for channel name "${GET_SHARED_RESOURCE}", Error: ${err}`)
        }
    })
}

/**
 * Routes 2-way asynchronous request-response operations between the worker thread and processRunner
 */
const processRunnerCallbackRouter = action => params =>
    new Promise((resolve, reject) => {
        const id = uuidv4()

        processRunnerCallbacks.push({
            id,
            callback: (err, data) => {
              if (err) return reject(err)
              return resolve(data)
            }
        })

        if (workerThreadBroadcastChannels[action]) workerThreadBroadcastChannels[action].postMessage({type: 'request', id, params})
        else console.error(`Error sending process runner callback, broadcast channel "${type}" does not exist`)
})

/**
 * Handles responses from the processRunner process
 * 
 * @param {*} args 
 */
const handleProcessRunnerCallback = data => {
    const i = processRunnerCallbacks.findIndex(({id}) => id === data.id)
    if (i < 0) return

    processRunnerCallbacks[i].callback(null, data.params)
    processRunnerCallbacks.splice(i, 1)
}

const solveCaptcha = processRunnerCallbackRouter(SOLVE_CAPTCHA)
const openBrowser = processRunnerCallbackRouter(OPEN_BROWSER)
const requestNewProxy = processRunnerCallbackRouter(REQUEST_NEW_PROXY)
const getSharedResource = processRunnerCallbackRouter(GET_SHARED_RESOURCE)

// Wrapper to additionally update the requesting task's proxy upon receiving a new proxy
const requestNewProxyWrapper = args =>
    new Promise(async (resolve, reject) => {
        try {
            // Request a new proxy
            const {rotate, current} = await requestNewProxy(args)

            // No need to check whether or not the task exists, as this method is only called from inside of a task
            const taskIndex = taskManager.tasks.findIndex(({id}) => id === args.id)

            // Set the current proxy to the newly requested proxy
            if (rotate) taskManager.tasks[taskIndex].runArgs.proxy.current = current

            return resolve()
        } catch (err) {
            console.error(`Error requesting a new proxy for task id ${args.id}, Error: ${err}`)
            return reject(err)
        }
    })

const sendStatusMessageCallback = args => workerThreadBroadcastChannels[SEND_STATUS_MESSAGE].postMessage({params: args})
const orderCallback = args => workerThreadBroadcastChannels[ORDER_CALLBACK].postMessage({params: args})
const setPrioritySharedResource = args => workerThreadBroadcastChannels[SET_PRIORITY_SHARED_RESOURCE].postMessage({params: args})
const initializationCallback = args => workerThreadBroadcastChannels[WORKER_THREAD_INITIALIZATION].postMessage({params: args})
const sendAnalytic = (type, args) => workerThreadBroadcastChannels[SEND_ANALYTIC].postMessage({params: {type, args}})

/**
 * Initializes the task manager
 */
 const initializeTaskManager = () => {

    try {
        // Initialize the IPC broadcast channels between the worker thread and the main process
        initializeBroadcastChannels()

        // Initialize the listeners for IPC sent to the worker thread from the main process
        initializeBroadcastChannelListeners()
        
        taskManager = new TaskManager(
            request,
            solveCaptcha,
            getNokamai,
            getPixel,
            getInitialFingerprint,
            openBrowser,
            getInitialLiveVariables,
            sendAnalytic,
            sendStatusMessageCallback,
            requestNewProxyWrapper,
            orderCallback,
            getSharedResource,
            setPrioritySharedResource
        )

    } catch (err) {
        // Throw the error in the worker thread
        throw err
    }
}


initializeTaskManager()

// Initialization callback to parent process
initializationCallback({workerIndex: workerData.workerIndex})
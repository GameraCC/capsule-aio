'use strict';

const crypto = require('crypto')
const Promise = require('bluebird')
const sites = require('../tasks/sites.js')
const fs = require('fs');
const { EventEmitter } = require('events');

Promise.config({
    cancellation: true,
    longStackTraces: true
})


class TaskManager extends EventEmitter {
  constructor(request, solveCaptcha, getNokamai, getPixel, getInitialFingerprint, openBrowser, getInitialLiveVariables, sendAnalytic, sendStatusMessageCallback, requestNewProxy, orderCallback, getSharedResource, setPrioritySharedResource) {
    // grab those event emitter protos
    super()
    // Add logging to the passed request function if running in GUI, otherwise use default request
    this.request = require('../qq-request-cookie')(request)

    /**
     * Captcha Solver
     * The solver is initialized after the creation of the taskmanger by using the initSolver function.
     * Usually the solver should always be loaded broe the application is ready, but if a function wants
     * to make sure, it can check taskManager.solver.isReady, or it can await taskManager.solver.promise
     *
     * Example code:
     *     console.log('sovlerReady1',taskManager.solver.isReady )
     *     taskManager.initSolver(solver)
     *     await taskManager.solver.promise
     *     console.log('sovlerReady2',taskManager.solver.isReady )
     *     console.log('solver',taskManager.solver)
     *     console.log('sovlerReady3',taskManager.solver.isReady)
     */
    this.initSolver = solver => {
      this.solver = solver
    }

    this.solveCaptcha = solveCaptcha
    this.getNokamai = getNokamai
    this.getPixel = getPixel
    this.getInitialFingerprint = getInitialFingerprint
    this.openBrowser = openBrowser
    this.getInitialLiveVariables = getInitialLiveVariables
    this.sendAnalytic = sendAnalytic
    this.sendStatusMessageCallback = sendStatusMessageCallback
    this.requestNewProxy = requestNewProxy
    this.orderCallback = orderCallback
    this.getSharedResource = getSharedResource
    this.setPrioritySharedResource = setPrioritySharedResource

    // Array of created tasks
    this.tasks = []
  }

  /**
   * Initializes live variables, assuming this is called after the websocket hello action returns default live variable values upon bot start
   */
  initializeLiveVariables() {
      try {
        if (this.liveVariables) return true
        else {
          /**
           * @type {Array.<{name: string, default: string, subscribed: Array.<{value: string | undefined, callback: Function>}>}
           */
          this.liveVariables = this.getInitialLiveVariables().map(variable => ({name: variable.key, default: variable.value, subscribed: []}))
        }  
      } catch (err) {
          return false
      }
  }

  /**
   * Function to invoke a send-status-message event to the ipcRenderer process, to change a task"s status
   *
   * @function sendStatusMessage
   *
   * @param {Object} args - Arguments to change a task"s status
   * @param {string} args.id - Id of task
   * @param {string} args.msg - Message to be updated to task"s status
   * @param {"success" | "error" | "warning" | "status" | "waiting" | "idle" } args.status - Type of message status
   * @param {Object} args.taskUpdates - Object containing task pane update parameters
   * @param {string} args.taskUpdates.product - Updates the product column on the task to the given value
   * @param {string} args.taskUpdates.size - Updates the size column on the task to the given value
   * @param {string} args.taskUpdates.billing - Updates the billing column on the task to the given value
   * @param {?boolean} args.bypassStoppedCheck - Bypass the check for whether or not the task is already stopped, to prevent ghost status messages
   */
  sendStatusMessage({ id, msg, status, taskUpdates, bypassStoppedCheck }, callback) {
    try {
        // console.log(`[${new Date().toISOString()}] [TaskManager] sendStatusMessage({id: "${id}", msg: "${msg}", status: ${status.toUpperCase()}}) invoked`)
        if (bypassStoppedCheck !== true && this.tasks.find(task => task.id === id && !task.state.started && task.state.stopped)) return
        
        // emit the status message
        this.sendStatusMessageCallback({ id, msg, status, taskUpdates })

        if (process.env.CAPSULE_ENV === 'staging') {
            if (msg && status) console.log(`[Task ID ${id}] [${status.toUpperCase()}] ${msg}`), fs.appendFileSync('./logs.txt', `[${new Date().toISOString()}] [Task ID ${id}] [${status.toUpperCase()}] ${msg} \n`)
            if (taskUpdates && (taskUpdates.product || taskUpdates.size || taskUpdates.billing)) console.log(`[${new Date().toISOString()}] [Task ID ${id}] [TASK UPDATES] Product: ${taskUpdates.product}, Size: ${taskUpdates.size}, Billing: ${taskUpdates.billing}`), fs.appendFileSync('./logs.txt', `[${new Date().toISOString()}] [Task ID ${id}] [TASK UPDATES] Product: ${taskUpdates.product}, Size: ${taskUpdates.size}, Billing: ${taskUpdates.billing} \n`)
        }            
    } catch (err) {
      console.error('sendStatusMessage error in TaskManager:', err)
      return callback ? callback({ success: false }) : false
    }
  }

  onLiveVariableUpdate(name, value) {
    try {
        const variable = this.liveVariables.find(variable => variable.name === name)
        if (!variable) throw new Error('Error updating live variable, name not found in updatable live variable names')
        else {
            variable.subscribed.forEach(subscribed => {
                // Save the old value of the reference
                let oldValue = subscribed.value

                // Assign the new value to the reference
                subscribed.value = value

                // Callback any on update callback for the live variable with the old reference value and new value
                if (subscribed.callback) subscribed.callback(oldValue, value)
            })

            // Update the default value of the variable to the new value
            variable.default = value
        }
    } catch (err) {
        console.error(`[ERROR] Error Updating Live Variable, ${err}`)
    }
  }

  /**
   * A callback called upon live variable updates
   * 
   * @callback liveVariableUpdateCallback
   * @param {any} oldValue - The old value of the liveVariable
   * @param {any} newValue - The newly updated value of the liveVariable
   */

  /**
   * A live variable object
   * 
   * @typedef {Object} LiveVariable
   * @property {any} value - The value of the live variable
   * @property {liveVariableUpdateCallback} callback - The assigned callback of the live variable 
   */

  /**
   * Subscribes a live variable
   * 
   * @param {string} name - Name of the live variable
   * @param {liveVariableUpdateCallback} callback - A callback called upon every live variable update
   * @returns {LiveVariable}
   */
  liveVariable(name, callback) {
    try {
        // Create the live variable reference
        let reference = {
            value: undefined,
            ...(callback && {callback})
        }

        this.initializeLiveVariables()

        // console.log('initial live variables: ', this.liveVariables)

        if (this.liveVariables) {
            // Find the live variable in the list of subscribable live variables
            const variable = this.liveVariables.find(variable => variable.name === name)
            if (!variable) throw new Error('Error subscribing live variable, name not found in subscribable live variable names')
            else {
                // Assign the reference the default value of the live variable
                reference.value = variable.default

                // Subscribe the reference to updates for the given live variable name
                variable.subscribed.push(reference)

                // Return the variable reference
                return reference
            }
        } else throw new Error('Error subscribing live variable, live variables not found in task manager')
    } catch (err) {
        return err
    }
  }

  /**
   * Updates a live variable's value
   * 
   * @param {string} key - The live variable key
   * @param {string} value - The value of the live variable to be updated with
   */
  updateLiveVariable({key, value}) {
    try {
        // Websocket request here to update the live variable for the given key to the given value
    } catch (err) {
        return err
    }
  }

  /**
   * Function to create a task
   *
   * @function createTask
   *
   * @param {Object} args - Arguments to create a task
   * @param {string} args.type - Name of the type of task to create
   * @param {string} arg.id - Id to assign to a task
   * @param {Object} args.group - Group of task
   * @param {Object} args.profile - Profile to be used in task
   * @param {Object} args.runArgs - Arguments relating to how task runs
   * @param {Object} args.productArgs - Arguments relating to task"s product
   * @param {Object} args.loginArgs - Arguments relating to a login used by task
   * @param {Object} args.webhookArgs - Arguments relating to webhook used by task
   */
  createTask({ type, id, group, profile, runArgs, productArgs, loginArgs, webhookArgs }, callback) {
    try {
      // Create task based on type, set an ID to the task, 8 random bytes + current unix timestamp to prevent duplicate IDs
      const _task = new sites[type].value({
        id,
        group,
        profile,
        runArgs,
        productArgs,
        loginArgs,
        webhookArgs,
        sendStatusMessage: this.sendStatusMessage.bind(this),
        liveVariable: this.liveVariable.bind(this),
        solveCaptcha: this.solveCaptcha,
        getNokamai: this.getNokamai,
        getPixel: this.getPixel,
        getInitialFingerprint: this.getInitialFingerprint,
        getSharedResource: this.getSharedResource,
        setPrioritySharedResource: this.setPrioritySharedResource,
        openBrowser: this.openBrowser,
        orderCallback: this.orderCallback,
        requestNewProxy: this.requestNewProxy,
        request: this.request,
        sendAnalytic: this.sendAnalytic
      })

      // Push task to task array, return task in callback
      this.tasks.push(_task)

      return callback({
        success: true,
        task: {
            id: _task.id,
            group: _task.group,
            profile: _task.profile,
            runArgs: _task.runArgs,
            productArgs: _task.productArgs,
            loginArgs: _task.loginArgs,
            webhookArgs: _task.webhookArgs,
          }
      })
    } catch (err) {
      return callback({ success: false, err })
    }
  }
}

module.exports = TaskManager

// const schema = {
//     type: {
//         type: "string",
//         description: "Type of order, error or success",
//         required: true,
//         enum: ["success", "error"],
//         default: ""
//     },
//     id: {
//         type: "string",
//         description: "Order ID of the item brought",
//         required: false,
//         default: ""
//     },
//     profile: {
//         type: "string",
//         description: "Name of the profile used to buy the item",
//         required: true,
//         default: ""
//     },
//     proxy: {
//         type: "string",
//         description: "Name of the proxy group used to buy the item",
//         required: true,
//         default: ""
//     },
//     email: {
//         type: "string",
//         description: "Email of the profile used to buy the item",
//         required: true,
//         default: ""
//     },
//     price: {
//         type: "int",
//         description: "Price of the item brought",
//         required: true,
//         default: 0
//     },
//     size: {
//         type: "string",
//         description: "Size of the item brought",
//         required: true,
//         default: ""
//     },
//     product: {
//         type: "string",
//         description: "ID / SKU / PID / URL of the item brought",
//         required: true,
//         default: ""
//     },
//     name: {
//         type: "string",
//         description: "Name of the item brought",
//         required: true,
//         default: ""
//     },
//     image: {
//         type: "string",
//         description: "Image URL of the item brought",
//         required: true,
//         default: "",
//     }
// }

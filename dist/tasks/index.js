'use strict';

const CookieJar = require('./capsuleCookie.js')
const crypto = require('crypto')
const random = require('random')
const seedrandom = require('seedrandom')
const lodash = require('lodash')

/*
    General task template module, includes default variables

    Notes:
        - Use this template to extend from in real modules
        - Ensure to use bluebird promises in tasks

    Parameters for external methods:
      solveCaptcha({type, url, siteKey, action})
      getNokamai({ parameters, url, cookie })
      getPixel({ parameters, id, hash })
      getInitialFingerprint()
*/

class Task {
  constructor({ id, group, profile, runArgs, productArgs, loginArgs, webhookArgs, sendStatusMessage, liveVariable, solveCaptcha, getNokamai, getPixel, getInitialFingerprint, getSharedResource, setPrioritySharedResource, openBrowser, orderCallback, requestNewProxy, request, sendAnalytic }) {
    // Initializing task variables
    this.profile = { ...profile }
    this.runArgs = { ...runArgs }
    this.productArgs = { ...productArgs }
    this.loginArgs = { ...loginArgs }
    /**
     * webhookArgs recommended structure
     * 
     * @param {Object} args - Webhook arguments
     * @param {string} url - The url of the webhook
     * @param {?true} generated - Whether or not the webhookArgs have been generated
     * @param {?string} name - Name of the product
     * @param {?string} product - PID / SKU of the product
     * @param {?string} size - Size of the product
     * @param {?number} price - Price of the product
     * @param {?string} image - Image of the product
     */
    this.webhookArgs = { ...webhookArgs }

    // Declaring start, stop and status task functions
    this.startTask = this.startTask
    this.stopTask = this.stopTask
    this.sendStatusMessage = sendStatusMessage
    this.liveVariable = liveVariable
    this.solveCaptcha = solveCaptcha
    this.getNokamai = getNokamai
    this.getPixel = getPixel
    this.getInitialFingerprint = getInitialFingerprint
    this.setPrioritySharedResource = setPrioritySharedResource
    this.openBrowser = openBrowser
    this.getSharedResource = getSharedResource
    this.orderCallback = orderCallback
    this.requestNewProxy = requestNewProxy
    this.request = request
    this.sendAnalytic = sendAnalytic

    // Declaring task ID
    this.id = id

    // Declaring group object containing checkout limit and ID
    this.group = group

    // Current state of the task
    this.state = {
      started: false, // Wether the task has started
      stopped: true, // Wether the task has stopped
      promises: {}, // Promises which are currently being executed / have been executed
      timeouts: {}, // Timeouts which are currently being executed
    }

    // All variables set within task must be inside this object
    this.variables = {
      // Static variables are variables set in the constructor, or variables which should not be deleted when the task is stopped
      static: {
        // Create a new cookiejar, and add the cookie jar to the task variables, this cookie jar is cleared when the task is stopped
        cookieJar: new CookieJar(),
      },
      // Dynamic variables are variables set in task, all these variables are cleared when the task is stopped
      dynamic: {},
    }

    // Initialize current proxy value
    this.runArgs.proxy.current = {
      host: '',
      port: '',
      username: '',
      password: '',
      parsed: '',
    }

    // parsed: this.runArgs.proxy ? `${this.runArgs.proxy.username && this.runArgs.proxy.password ? `http://${this.runArgs.proxy.username}:${this.runArgs.proxy.password}@${this.runArgs.proxy.host}:${this.runArgs.proxy.port}` : `http://${this.runArgs.proxy.host}:${this.runArgs.proxy.port}`}`: ""
  }

  randomInt = (min, max) => {
    const randomString = `${crypto.randomBytes(8).toString('hex')}-${Date.now()}`
    random.use(seedrandom(randomString))
    return random.int(min, max)
  }
  randomUUIDV1 = () => {
    return `${crypto.randomBytes(4).toString('hex')}-${crypto.randomBytes(2).toString('hex')}-${crypto.randomBytes(2).toString('hex')}-${crypto.randomBytes(2).toString('hex')}-${crypto.randomBytes(6).toString('hex')}`
  }
  randomUUIDV4 = () => {
    return `${crypto.randomBytes(4).toString('hex')}-${crypto.randomBytes(2).toString('hex')}-4${crypto.randomBytes(2).toString('hex').slice(1, 4)}-${crypto.randomBytes(2).toString('hex')}-${crypto
      .randomBytes(6)
      .toString('hex')}`
  }
  monitorDelay = delay => {
    return new Promise(resolve => setTimeout(resolve, delay ? delay : this.runArgs.monitor_delay))
  }

  editTask({ profile, runArgs, productArgs, loginArgs, webhookArgs }, callback) {
    try {
      this.profile = lodash.merge(this.profile, profile)
      this.runArgs = lodash.merge(this.runArgs, runArgs)
      this.productArgs = lodash.merge(this.productArgs, productArgs)
      this.loginArgs = lodash.merge(this.loginArgs, loginArgs)
      this.webhookArgs = lodash.merge(this.webhookArgs, webhookArgs)
      return callback ? callback({ success: true }) : true
    } catch (err) {
      console.error(err)
      return callback ? callback({ success: false }) : false
    }
  }

  /**
   * Method for stopping tasks from GUI, this method sends stopping status messages
   */
  stopTaskGui(callback) {
      try {
          if (this.state.started && !this.state.stopped) {
            this.stopTask(res => {
                if (res.success) {
                    this.sendStatusMessage({id: this.id, msg: 'Stopped', status: 'idle', bypassStoppedCheck: true})
                    return callback ? callback({success: true}) : true
                } else if (res.err) {
                    this.sendStatusMessage({id: this.id, msg: `Error Stopping Task (${res.err})`, status: 'error', bypassStoppedCheck: true})
                    return callback ? callback({success: false}) : false
                } else return callback ? callback({success: false}) : false // This should only be executed if the task somehow changes its state during the method call, or if the err property on the response object is falsy
            })
          } else return callback ? callback({success: false}) : false // Don't send a status message if already stopped
      } catch (err) {
          console.error(err)
          return callback ? callback({success: false}) : false
      }
  }

  /**
   * Method for starting tasks from GUI, this method does send stopping status messages
   */
  startTaskGui(callback) {
      try {
        if (!this.state.started && this.state.stopped) {
            this.sendStatusMessage({id: this.id, msg: 'Starting', status: 'status', bypassStoppedCheck: true})
            this.startTask((res) => {
                if (res.success) {
                    return callback ? callback({success: true}) : true
                } else if (res.err) {
                    this.sendStatusMessage({id: this.id, msg: `Error Starting Task (${res.err})`, status: 'error', bypassStoppedCheck: true})
                    return callback ? callback({success: false}) : false
                } else return callback ? callback({success: false}) : false // This should only be executed if the task somehow changes its state during the method call, or if the err property on the response object is falsy
            })
        } else return callback ? callback({success: false}) : false // Don't send a status message if already started
      } catch (err) {
          console.error(err)
          return callback ? callback({success: false}) : false
      }
  }

  stopTask(callback) {
    try {
      if (this.state.started && !this.state.stopped) {
        // Update state
        this.state.started = false
        this.state.stopped = true

        // Clear cookie jar, reset dynamic variables set by task
        this.variables.static.cookieJar.clearCookies()
        this.variables.dynamic = {}

        // Stop current active promises and timeouts
        Object.keys(this.state.promises).forEach(promise => {
          !this.state.promises[promise].isFulfilled() && this.state.promises[promise].cancel()
          delete this.state.promises[promise]
        })
        Object.keys(this.state.timeouts).forEach(timeout => {
          clearTimeout(this.state.timeouts[timeout])
          delete this.state.timeouts[timeout]
        })

        return callback ? callback({ success: true }) : true
      } else {
        return callback ? callback({ success: false, err: 'Already Stopped' }) : false
      }
    } catch (err) {
      console.error(err)
      return callback ? callback({ success: false, err: 'Catch Full' }) : false
    }
  }
}

module.exports = Task

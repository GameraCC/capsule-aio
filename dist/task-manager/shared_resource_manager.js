const Promise = require('bluebird')
const crypto = require('crypto')
const { YEEZYSUPPLY_CAPTCHA } = require('./shared_resource_types.js')

Promise.config({
    cancellation: true,
    longStackTraces: true
})

class SharedResourceManager {
    constructor(solveCaptcha, openBrowser) {
        this.solveCaptcha = solveCaptcha
        this.openBrowser = openBrowser

        /**
         * @type {Array.<{type: string, limits: Array.<SharedResourceLimit>, promise: Promise, value, state: {uses: number, tasks: [], start: number | undefined}}>}
         */
        this.sharedResources = []
    }

  /**
   * A Shared Resource Limitation Function
   * 
   * @typedef {Object} SharedResourceLimit
   * @property {'PER_USE' | 'PER_TASK' | 'PER_TIME' | 'PER_RESOURCE'} type - The type of limitation function
   * @property {number | undefined} max - The max amount of times a shared resource can be used based on it's type. Using the PER_TIME type this field should be the amount of time in milliseconds. Using the PER_RESOURCE type, this field should be undefined
   *
   * Type use cases, in order of precedence
   * PER_RESOURCE - Per shared resource creation, limit how many times a task can fetch this this shared resource by nothing but it's instantation, never deletes the shared resource
   * PER_TIME - Per the amount of time since instantiation of a shared resource, limit how many times a task can fetch this rshared esource by the amount of time since it's instantation, deletes the shared resource upon expiry of time limit
   * PER_USE - Per the use of a shared resource, limit how many times a task can fetch this shared resource through a counter incremented on fetching the shared resource, deletes the shared resource upon uses equal to use limit
   * PER_TASK - Per the amount of tasks using the shared resource, limit how many times a task can fetch this resource through the amount of tasks CURRENTLY running and using the shared resource, the amount of tasks is calculated per shared resource fetch, deletes the shared resource upon tasks equal to use limit
   */

   /**
    * Checks if the shared resource limits have been matched.
    * Deletes the shared resource from the shared resources
    * array if the limitation has been matched
    * 
    * @param {Object} sharedResource - The shared resource which limits should be checked
    * @param {string} id - Id of the task requesting the shared resource
    * @returns {boolean} Whether or not the shared resource can be used
    */
    checkSharedResourceLimits(sharedResource, id) {
        const checks = []

        if (!sharedResource) return false

        for (const limit of sharedResource.limits) {
            switch (limit.type) {
                case 'PER_RESOURCE':
                    checks.push({type: 'PER_RESOURCE', valid: true})
                    break
                    case 'PER_TIME':
                        if ((sharedResource.state.start && Date.now() < sharedResource.state.start + limit.max) || !sharedResource.state.start) checks.push({type: 'PER_TIME', valid: true})
                        else {
                            this.sharedResources = this.sharedResources.filter(({id}) => id !== sharedResource.id)
                            checks.push({type: 'PER_TIME', valid: false})
                        }
                        break
                    case 'PER_USE':
                        if (sharedResource.state.uses < limit.max) checks.push({type: 'PER_USE', valid: true})
                        else {
                            this.sharedResources = this.sharedResources.filter(({id}) => id !== sharedResource.id)
                            checks.push({type: 'PER_USE', valid: false})
                        }
                        break
                    case 'PER_TASK':
                        if (sharedResource.state.tasks.includes(id)) {
                            checks.push({type: 'PER_TASK', valid: true})
                            break
                        }

                        const tasks = this.tasks.filter(task => sharedResource.state.tasks.includes(task.id) && task.state.started && !task.state.stopped)
                        if (tasks.length < limit.max) checks.push({type: 'PER_TASK', valid: true})
                        else checks.push({type: 'PER_TASK', valid: false})
                        break
            }
        }

        if (checks.some(({valid}) => !valid)) return false
        else return true
    }

    /**
     * Increments a shared resource limit
     * 
     * @param {Object} sharedResource - The shared resource which limits should be incremented
     * @param {string} id - The id of the task getting the shared resource
     * @returns {boolean} - Whether or not incrementing the shared resource limits was successful
     */
    incrementSharedResourceLimits(sharedResource, id) {
        try {
            !sharedResource.state.tasks.includes(id) && sharedResource.state.tasks.push(id)
            sharedResource.state.uses++

            return true
        } catch (err) {
            return false
        }
    }

    /**
     * Sets a priority shared resource by pushing it to the top of the sharedResource array,
     * causing the shared resource to be used over any other shared resources if the resource
     * limits are valid upon the gievn use
     * 
     * @param {Object} args - Arguments to set a priority shared resource
     * @param {'YEEZYSUPPLY_CAPTCHA'} type - The type of shared resource
     * @param {Array.<SharedResourceLimit} args.limits - Listed limitation functions of the shared resource, stacking has AND validation behaviour, when using a PER_RESOURCE type, there should be no other limitation functions
     * @param {Array | Object | string | number} args.value - The value of the shared resource to be set
     */
    setPrioritySharedResource({type, limits, value}) {
        try {
            if (!value || !type || !limits || !limits.length) throw new Error('Atleast 1 resource limitation, type, and value must be defined')
            if (limits.length !== 1 && limits.find(limit => limit.type === 'PER_RESOURCE')) throw new Error('A per resource limit may not have any other limitation functions')
            if (limits.length > 4) throw new Error('Can not use more than 4 resource limitation functions')
            if (limits.filter((limit, i) => limits.findIndex(_limit => _limit.type === limit.type) === i).length !== limits.length) throw new Error('Limits may not include duplicate limit types')                
        
            // Create the shared resource
            const sharedResource = {
                id: crypto.randomBytes(4).toString('hex'),
                type,
                limits,
                awaitPromise: Promise.resolve(), // Resolved promise, as this value is definite
                value,
                state: {
                    uses: 0,
                    tasks: [],
                    start: Date.now()
                }
            }
        
            this.sharedResources.unshift(sharedResource)    
        } catch (err) {
            return err
        }
    }

    /**
     * Returns a promise executing code for a given shared resource
     * 
     * @param {string} type - The type of shared resource to get a promise for
     * @returns {Promise} - Promise handling code to be executed for the shared resource
     */
    getPromiseForType = (type, params) => () =>
        new Promise(async (resolve, reject) => {
            try {
                switch (type) {
                    case YEEZYSUPPLY_CAPTCHA:
                        const captchaToken = await this.solveCaptcha(params)
                        return resolve(captchaToken)
                        break
                }                     
            } catch (err) {
                console.error(`Error in sharedResource promise, executed for type "${type}", Error: ${err}`)
            }
        })

    /**
     * Gets or creates a shared resource, to share across tasks
     * 
     * @param {Object} args - Arguments to get a shared resource
     * @param {string} args.id - Id of the task getting a shared resource
     * @param {'YEEZYSUPPLY_CAPTCHA'} args.type - The type of shared resource
     * @param {Array.<SharedResourceLimit>} args.limits - Listed limitation functions of the shared resource, stacking has AND validation behaviour, when using a PER_RESOURCE type, there should be no other limitation functions
     * @param {Function} args.params - Parameters to be passed to the get promise for type function, should include any variables needed for the code being executed in the promise
     * @param {?false} args.initialize - If the shared resource value should not be initialized, only checked, undefined is resolved if there is no shared resource, or the shared resource limits given it's type is not valid
     */
    getSharedResource({id, type, limits, params, initialize}) {
        return new Promise((resolve, reject) => {
            try {
                const promise = this.getPromiseForType(type, params)
                const sharedResource = this.sharedResources.find((resource) => resource.type === type && this.checkSharedResourceLimits(resource, id))

                if (initialize === false) {
                    if (sharedResource && sharedResource.awaitPromise.isFulfilled() && this.incrementSharedResourceLimits(sharedResource, id)) { // Return the shared resource value given it's type
                        return resolve(sharedResource.value)
                    } else return resolve(undefined) // Return the value as undefined, as it is not valid given the limits, and type
                }

                if (sharedResource && sharedResource.awaitPromise.isFulfilled() && this.incrementSharedResourceLimits(sharedResource, id)) { // Return the shared resource value given it's type
                    return resolve(sharedResource.value)
                } else if (sharedResource && !sharedResource.awaitPromise.isFulfilled() && this.incrementSharedResourceLimits(sharedResource, id)) { // Wait for the shared resource value to resolve
                    sharedResource.awaitPromise.then(() => {
                        return resolve(sharedResource.value)
                    })
                } else { // Create the shared resource
                    if (!id || !type || !promise || !limits || !limits.length) throw new Error('Atleast 1 resource limitation, task id, type, and promise must be defined')
                    if (limits.length !== 1 && limits.find(limit => limit.type === 'PER_RESOURCE')) throw new Error('A per resource limit may not have any other limitation functions')
                    if (limits.length > 4) throw new Error('Can not use more than 4 resource limitation functions')
                    if (limits.filter((limit, i) => limits.findIndex(_limit => _limit.type === limit.type) === i).length !== limits.length) throw new Error('Limits may not include duplicate limit types')                

                    // Start the promise
                    const _promise = promise()
                    let resolveTaskAwaitPromise;

                    const sharedResource = {
                        id: crypto.randomBytes(4).toString('hex'),
                        type,
                        limits,
                        awaitPromise: new Promise(_resolve => resolveTaskAwaitPromise = _resolve), // Instantiate the task await promise
                        value: undefined, 
                        state: {
                            uses: 1,
                            tasks: [id],
                            start: undefined
                        }
                    }

                    // Push the shared resource to the shared resource array, so other tasks can await this shared resourec
                    this.sharedResources.push(sharedResource)

                    // Set the shared resource value
                    _promise.then((value) => {
                        sharedResource.value = value
                        sharedResource.state.start = Date.now()
                        resolveTaskAwaitPromise() // Resolve the promise for tasks awaiting the value of the shared resource promise
                        return resolve(value)
                    })
                }
            } catch (err) {
                return reject(err)
            }
        })
    }
}

module.exports = SharedResourceManager
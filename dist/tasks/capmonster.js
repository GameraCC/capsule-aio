const Promise = require('bluebird')

Promise.config({
    cancellation: true,
    longStackTraces: true
})

class Capmonster {
    /**
     * 
     * @param {Object} parent - This variable of the task using 2captcha 
     */
    constructor(parent) {
        this.parent = parent

        this.solveTimeout = 120000 // The time out in milliseconds for a 2captcha recaptcha solve
        this.retrySolveTimeoutDelay = 3000 // The retry delay upon timeout
    }

    requestSolve({type, url, siteKey}) {
        return new Promise((resolve, reject, onCancel) => {
            let cancelled = false
            onCancel(() => cancelled = true)
            try {
                this.parent.sendStatusMessage({id: this.parent.id, msg: 'Requesting Capmonster', status: 'status'})

                const data = {
                    clientKey: this.parent.runArgs.capmonster.api_key,
                    task: {
                        type: 'NoCaptchaTaskProxyless',
                        websiteURL: url,
                        websiteKey: siteKey,
                        userAgent: this.parent.variables.static.userAgent
                    }
                }
                
                if (cancelled || !this.parent.state.started && this.parent.state.stopped) return

                this.parent.request({
                    url: `https://api.capmonster.cloud/createTask`,
                    method: 'POST',
                    body: data
                }, (err, res) => {
                    try {
                        if (err) {
                            this.parent.sendStatusMessage({id: this.parent.id, msg: 'Error Requesting Capmonster (Request)', status: 'warning'})
                            return reject()
                        } else {
                            if (res.statusCode === 200 || res.statusCode === 403) {
                                const resJSON = JSON.parse(res.body)
                                if (resJSON.errorId === 0) {
                                    this.taskId = resJSON.taskId
                                    return resolve()
                                } else if (resJSON.errorId === 1) {
                                    if (resJSON.errorCode === 'ERROR_KEY_DOES_NOT_EXIST') {
                                        this.parent.sendStatusMessage({id: this.parent.id, msg: `Invalid Capmonster API Key`, status: 'error'})
                                        this.parent.stopTask()
                                        return 
                                    } else if (resJSON.errorCode === 'ERROR_ZERO_BALANCE') {
                                        this.parent.sendStatusMessage({id: this.parent.id, msg: `Capmonster Key Out Of Funds`, status: 'error'})
                                        this.parent.stopTask()
                                        return
                                    } else {
                                        this.parent.sendStatusMessage({id: this.parent.id, msg: `Error Requesting Capmonster (${resJSON.errorCode})`, status: 'warning'})
                                        return reject()    
                                    }
                                } else {
                                    this.parent.sendStatusMessage({id: this.parent.id, msg: `Error Requesting Capmonster (Invalid Response)`, status: 'warning'})
                                    return reject()
                                }
                            } else {
                                this.parent.sendStatusMessage({id: this.parent.id, msg: `Error Requesting Capmonster (Status ${res.statusCode})`, status: 'warning'})
                                return reject()
                            }
                        }
                    } catch (err) {
                        this.parent.sendStatusMessage({id: this.parent.id, msg: 'Error Requesting Capmonster (Catch Request)', status: 'warning'})
                        return reject()
                    }
                })
            } catch (err) {
                this.parent.sendStatusMessage({id: this.parent.id, msg: 'Error Requesting Capmonster (Catch Full)', status: 'warning'})
                return reject()
            }
        })
    }

    checkRecaptchaSolve() {
        return new Promise((resolve, reject, onCancel) => {
            let cancelled = false
            onCancel(() => cancelled = true)
            try {
                this.parent.sendStatusMessage({id: this.parent.id, msg: 'Getting Capmonster Result', status: 'status'})

                const data = {
                    clientKey: this.parent.runArgs.capmonster.api_key,
                    taskId: this.taskId
                }
                
                if (cancelled || !this.parent.state.started && this.parent.state.stopped) return

                this.parent.request({
                    url: `https://api.capmonster.cloud/getTaskResult`,
                    method: 'POST',
                    body: JSON.stringify(data)
                }, (err, res) => {
                    try {
                        if (err) {
                            this.parent.sendStatusMessage({id: this.parent.id, msg: 'Error Getting Capmonster Result (Request)', status: 'warning'})
                            return reject()
                        } else {
                            if (res.statusCode === 200 || res.statusCode === 403) {
                                const resJSON = JSON.parse(res.body)
                                if (resJSON.errorId === 0) {
                                    if (resJSON.status === 'ready') {
                                        return resolve(resJSON.solution.gRecaptchaResponse) // Resolve the captcha token
                                    } else if (resJSON.status === 'processing') {
                                        this.parent.sendStatusMessage({id: this.parent.id, msg: 'Waiting For Capmonster', status: 'waiting'})
                                        return reject()
                                    } else {
                                        this.parent.sendStatusMessage({id: this.parent.id, msg: 'Error Waiting For Capmonster (Invalid Status)', status: 'waiting'})
                                        return reject()
                                    }
                                } else if (resJSON.errorId === 1) {
                                    // The 2captcha API misspells 'CAPTCHA_NOT_READY' as 'CAPCHA_NOT_READY', and the capmonster API spells 'CAPTCHA_NOT_READY', both are checked
                                    if (resJSON.errorCode === 'CAPTCHA_NOT_READY' || resJSON.errorCode === 'CAPCHA_NOT_READY') {
                                        this.parent.sendStatusMessage({id: this.parent.id, msg: 'Waiting For Capmonster', status: 'waiting'})
                                        return reject()
                                    } else {
                                        this.parent.sendStatusMessage({id: this.parent.id, msg: `Error Getting Capmonster Result (${resJSON.errorCode})`, status: 'warning'})
                                        return reject()    
                                    }
                                } else {
                                    this.parent.sendStatusMessage({id: this.parent.id, msg: `Error Getting Capmonster Result (Invalid Response)`, status: 'warning'})
                                    return reject()
                                }
                            } else {
                                this.parent.sendStatusMessage({id: this.parent.id, msg: `Error Getting Capmonster Result (Status ${res.statusCode})`, status: 'warning'})
                                return reject()
                            }
                        }
                    } catch (err) {
                        this.parent.sendStatusMessage({id: this.parent.id, msg: 'Error Getting Capmonster Result (Catch Request)', status: 'warning'})
                        return reject()
                    }
                })
            } catch (err) {
                this.parent.sendStatusMessage({id: this.parent.id, msg: 'Error Getting Capmonster Result (Catch Full)', status: 'warning'})
                return reject()
            }
        })
    }

    solveRecaptchaWrapper({type, url, siteKey}) {
        return new Promise((resolve, reject) => {
            const requestSolveWrapper = () => {
                this.parent.state.promises['requestSolve'] = this.requestSolve({type, url, siteKey}).then(() => {
                    // Set a solve timeout, for when solves take too long
                    const solveTimeoutPromise = new Promise(resolve => setTimeout(resolve, this.solveTimeout)).then(() => {
                        // Send timeout error message
                        this.parent.sendStatusMessage({id: this.parent.id, msg: 'Capmonster Solve Timed Out', status: 'warning'})

                        // Garbage collect promises and timeouts
                        this.parent.state.promises['requestSolve']?.isFulfilled() === false && this.parent.state.promises['requestSolve'].cancel()
                        this.parent.state.promises['checkRecaptchaSolve']?.isFulfilled() === false && this.parent.state.promises['checkRecaptchaSolve'].cancel()
                        clearTimeout(this.parent.state.timeouts['requestSolve'])
                        clearTimeout(this.parent.state.timeouts['checkRecaptchaSolve'])
                        
                        // Retry requesting a solve
                        this.parent.state.timeouts['requestSolve'] = setTimeout(requestSolveWrapper, this.retrySolveTimeoutDelay)
                    })
                    
                    const checkRecaptchaSolveWrapper = () => {
                        this.parent.state.promises['checkRecaptchaSolve'] = this.checkRecaptchaSolve().then((captchaToken) => {
                            solveTimeoutPromise.cancel()
                            return resolve(captchaToken)
                        }).catch((err) => this.parent.state.timeouts['checkRecaptchaSolve'] = setTimeout(checkRecaptchaSolveWrapper, 5000))
                    }
                    
                    // Update the task to waiting for 2captcha, as the timeout is set
                    this.parent.sendStatusMessage({id: this.parent.id, msg: 'Waiting For Capmonster', status: 'waiting'})
                    
                    // Wait 15 seconds after captcha is initialized, prior to checking for a result
                    setTimeout(checkRecaptchaSolveWrapper, 15000);
                }).catch((err) => this.parent.state.timeouts['requestSolve'] = setTimeout(requestSolveWrapper, this.parent.runArgs.retry_delay))    
            }
            requestSolveWrapper()
        })
    }

    /**
     * 
     * @param {Object} args - Arguments to request a captcha solve 
     * @param {'RECAPTCHA_V2_VISIBLE' | 'RECAPTCHA_V3_INVISIBLE'} args.type - The type of captcha to be solved
     * @param {string} args.url - Url of the page with a recaptcha
     * @param {string} args.siteKey - Site key of the page with a recaptcha
     */
    solveCaptcha({type, url, siteKey}) {
        return new Promise(async (resolve, reject) => {
            try {

                let captchaToken
                switch (type) {
                    case 'RECAPTCHA_V2_VISIBLE':
                    case 'RECAPTCHA_V2_INVISIBLE':
                        captchaToken = await this.solveRecaptchaWrapper({type, url, siteKey})
                        break
                    default:
                        throw new Error('Capmonster: Unsupported Captcha Type Requested')
                }
    
                if (captchaToken) {
                    return resolve(captchaToken)
                } else throw new Error('Capmonster: No captcha token returned')
            } catch (err) {
                return reject(err)
            }    
        })
    }
}

module.exports = Capmonster
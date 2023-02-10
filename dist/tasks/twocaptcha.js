const Promise = require('bluebird')

Promise.config({
    cancellation: true,
    longStackTraces: true
})

class TwoCaptcha {
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
                this.parent.sendStatusMessage({id: this.parent.id, msg: 'Requesting 2Captcha', status: 'status'})

                let data

                switch (type) {
                    case 'RECAPTCHA_V2_VISIBLE':
                    case 'RECAPTCHA_V2_INVISIBLE':
                        data = new URLSearchParams({
                            key: this.parent.runArgs.twocaptcha.api_key,
                            method: 'userrecaptcha',
                            googlekey: siteKey,
                            pageurl: url,
                            json: 1,
                            invisible: type === 'RECAPTCHA_V2_INVISIBLE' ? 1 : 0
                        })
                }
                
                if (cancelled || !this.parent.state.started && this.parent.state.stopped) return

                this.parent.request({
                    url: `https://2captcha.com/in.php?${data.toString()}`,
                    method: 'POST'
                }, (err, res) => {
                    try {
                        if (err) {
                            this.parent.sendStatusMessage({id: this.parent.id, msg: 'Error Requesting 2Captcha (Request)', status: 'warning'})
                            return reject()
                        } else {
                            if (res.statusCode === 200) {
                                const resJSON = JSON.parse(res.body)
                                if (resJSON.status === 1) {
                                    this.captchaId = resJSON.request
                                    return resolve()
                                } else if (resJSON.status === 0) {
                                    if (resJSON.request === 'ERROR_WRONG_USER_KEY' || resJSON.request === 'ERROR_KEY_DOES_NOT_EXIST') {
                                        this.parent.sendStatusMessage({id: this.parent.id, msg: `Invalid 2Captcha API Key`, status: 'error'})
                                        this.parent.stopTask()
                                        return 
                                    } else if (resJSON.request === 'ERROR_ZERO_BALANCE') {
                                        this.parent.sendStatusMessage({id: this.parent.id, msg: `2Captcha Key Out Of Funds`, status: 'error'})
                                        this.parent.stopTask()
                                        return
                                    } else {
                                        this.parent.sendStatusMessage({id: this.parent.id, msg: `Error Requesting 2Captcha (${resJSON.request})`, status: 'warning'})
                                        return reject()    
                                    }
                                } else {
                                    this.parent.sendStatusMessage({id: this.parent.id, msg: `Error Requesting 2Captcha (Invalid Response)`, status: 'warning'})
                                    return reject()
                                }
                            } else {
                                this.parent.sendStatusMessage({id: this.parent.id, msg: `Error Requesting 2Captcha (Status ${res.statusCode})`, status: 'warning'})
                                return reject()
                            }
                        }
                    } catch (err) {
                        this.parent.sendStatusMessage({id: this.parent.id, msg: 'Error Requesting 2Captcha (Catch Request)', status: 'warning'})
                        return reject()
                    }
                })
            } catch (err) {
                this.parent.sendStatusMessage({id: this.parent.id, msg: 'Error Requesting 2Captcha (Catch Full)', status: 'warning'})
                return reject()
            }
        })
    }

    checkRecaptchaSolve() {
        return new Promise((resolve, reject, onCancel) => {
            let cancelled = false
            onCancel(() => cancelled = true)
            try {
                this.parent.sendStatusMessage({id: this.parent.id, msg: 'Getting 2Captcha Result', status: 'status'})

                const data = new URLSearchParams({
                    key: this.parent.runArgs.twocaptcha.api_key,
                    action: 'get',
                    id: this.captchaId,
                    json: 1
                })
                
                if (cancelled || !this.parent.state.started && this.parent.state.stopped) return

                this.parent.request({
                    url: `https://2captcha.com/res.php?${data.toString()}`,
                    method: 'POST'
                }, (err, res) => {
                    try {
                        if (err) {
                            this.parent.sendStatusMessage({id: this.parent.id, msg: 'Error Getting 2Captcha Result (Request)', status: 'warning'})
                            return reject()
                        } else {
                            if (res.statusCode === 200) {
                                const resJSON = JSON.parse(res.body)
                                if (resJSON.status === 1) {
                                    return resolve(resJSON.request) // Resolve the captcha token
                                } else if (resJSON.status === 0) {
                                    // The 2captcha API misspells 'CAPTCHA_NOT_READY' as 'CAPCHA_NOT_READY', both are checked in case of a fix 
                                    if (resJSON.request === 'CAPCHA_NOT_READY' || resJSON.request === 'CAPTCHA_NOT_READY') {
                                        this.parent.sendStatusMessage({id: this.parent.id, msg: 'Waiting For 2Captcha', status: 'waiting'})
                                        return reject()
                                    } else {
                                        this.parent.sendStatusMessage({id: this.parent.id, msg: `Error Getting 2Captcha Result (${resJSON.request})`, status: 'warning'})
                                        return reject()    
                                    }
                                } else {
                                    this.parent.sendStatusMessage({id: this.parent.id, msg: `Error Getting 2Captcha Result (Invalid Response)`, status: 'warning'})
                                    return reject()
                                }
                            } else {
                                this.parent.sendStatusMessage({id: this.parent.id, msg: `Error Getting 2Captcha Result (Status ${res.statusCode})`, status: 'warning'})
                                return reject()
                            }
                        }
                    } catch (err) {
                        this.parent.sendStatusMessage({id: this.parent.id, msg: 'Error Getting 2Captcha Result (Catch Request)', status: 'warning'})
                        return reject()
                    }
                })
            } catch (err) {
                this.parent.sendStatusMessage({id: this.parent.id, msg: 'Error Getting 2Captcha Result (Catch Full)', status: 'warning'})
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
                        this.parent.sendStatusMessage({id: this.parent.id, msg: '2Captcha Solve Timed Out', status: 'warning'})

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
                    this.parent.sendStatusMessage({id: this.parent.id, msg: 'Waiting For 2Captcha', status: 'waiting'})
                    
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
                        throw new Error('2Captcha: Unsupported Captcha Type Requested')
                }
    
                if (captchaToken) {
                    return resolve(captchaToken)
                } else throw new Error('2Captcha: No captcha token returned')
            } catch (err) {
                return reject(err)
            }    
        })
    }
}

module.exports = TwoCaptcha
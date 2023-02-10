'use strict';

const Promise = require('bluebird')
const Task = require('./')

Promise.config({
  cancellation: true,
  longStackTraces: true,
})

class TEST_SITE extends Task {
    constructor({ id, group, profile, runArgs, productArgs, loginArgs, webhookArgs, sendStatusMessage, liveVariable, solveCaptcha, getNokamai, getPixel, getInitialFingerprint, getSharedResource, setPrioritySharedResource, openBrowser, orderCallback, requestNewProxy, request, sendAnalytic }) {
        super({id, group, profile, runArgs, productArgs, loginArgs, webhookArgs, sendStatusMessage, liveVariable, solveCaptcha, getNokamai, getPixel, getInitialFingerprint, getSharedResource, setPrioritySharedResource, openBrowser, orderCallback, requestNewProxy, request, sendAnalytic});

    this.variables.static.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36'
  }

  testRequest() {
    return new Promise(async (resolve, reject, onCancel) => {
      let cancelled = false
      onCancel(() => {
        cancelled = true
      })
      try {
        this.sendStatusMessage({ id: this.id, msg: `Testing Request`, status: 'status', taskUpdates: { product: 'Speed Test!' } })
        if (cancelled || !this.state.started || this.state.stopped) return

        this.requestNewProxy({ id: this.id })
        // console.log(this.runArgs.proxy.current)

        this.request(
          {
            url: `https://www.httpbin.org/post`,
            method: 'POST',
            headers: {
              accept: 'text/javascript, text/html, application/xml, text/xml, */*',
              'accept-encoding': 'gzip, deflate, br',
              'accept-language': 'en-US,en;q=0.9',
              'cache-control': 'no-cache',
              'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
              pragma: 'no-cache',
              'sec-fetch-dest': 'empty',
              'sec-fetch-mode': 'cors',
              'sec-fetch-site': 'same-origin',
              'user-agent': `${this.variables.static.userAgent}`,
              'x-prototype-version': '1.7',
              'x-requested-with': 'XMLHttpRequest',
            },
            cookieJar: this.cookieJar
          },
          async (err, res) => {
            if (cancelled || !this.state.started || this.state.stopped) return
            try {
              if (err) {
                this.sendStatusMessage({ id: this.id, msg: `Error Testing Request (Request)`, status: 'error' })
                return reject(err)
              } else {
                this.sendStatusMessage({ id: this.id, msg: `Tested Request`, status: 'status' })
                if (res.statusCode === 200) {

                  // Initial Nokamai test
                  this.sendStatusMessage({ id: this.id, msg: `Getting initial Nokamai...`})
                  try{
                    const result = await this.getInitialFingerprint()
                    this.sendStatusMessage({ id: this.id, msg: `Got initial Nokamai!`, status: 'success'})
                  } catch(err) {
                    this.sendStatusMessage({ id: this.id, msg: `Unable to get initial Nokamai...`, status: 'error'})
                  }          
                  

                  // subsequent nokamai test
                  let tries = 0

                  do{
                    this.sendStatusMessage({ id: this.id, msg: `Getting #${tries+1} Nokamai...`, status: 'status'})

                    try{
                    const result = await this.getNokamai({ url: "https://www.test.com", cookie: "test"})
                    this.sendStatusMessage({ id: this.id, msg: `Got #${tries+1} Nokamai!`, status: 'success'})

                    } catch(err) {
                      this.sendStatusMessage({ id: this.id, msg: `Unable to get #${tries+1} Nokamai...`, status: 'error'})
                    }
                  }while(tries++ < 5)

                  // pixel test
                  this.sendStatusMessage({ id: this.id, msg: `Getting Pixel...`, status: 'status'})
                  try{
                    const result = await this.getPixel({ id: 'test', hash: 'test' })
                    this.sendStatusMessage({ id: this.id, msg: `Got Pixel!`, status: 'success'})
                  }catch(err){
                    this.sendStatusMessage({ id: this.id, msg: `Unable to get Piel...`, status: 'error'})
                  }

                  return resolve()
                } else {
                  this.sendStatusMessage({ id: this.id, msg: `Error Testing Request (Status ${res.statusCode})`, status: 'error' })
                  return reject()
                }
              }
            } catch (err) {
              this.sendStatusMessage({ id: this.id, msg: `Error Testing Request (Catch Request)`, status: 'error' })
              return reject(err)
            }
          },
        )
      } catch (err) {
        console.log(err)
        this.sendStatusMessage({ id: this.id, msg: `Error Testing Request (Catch Full)`, status: 'error' })
        return reject()
      }
    })
  }

  stop() {
    this.orderCallback({ order: { stuff: '123' }, taskId: this.taskId })
  }

  testFlow() {
    const task = this
    const testRequestWrapper = async () => {
      task.state.promises['testRequest'] = task
        .testRequest()
        .then(async () => {
          // task.sendStatusMessage({ id: task.id, msg: 'Test Request Successful', status: 'success' })
        })
        .catch(err => {
          task.state.timeouts['testRequest'] = setTimeout(testRequestWrapper, task.runArgs.delay)
        })
    }
    testRequestWrapper()
  }

  startTask(callback) {
    try {
      if (!this.state.started && this.state.stopped) {
        // Update state
        this.state.started = true
        this.state.stopped = false

        const thing = this.requestNewProxy({ id: this.id })

        // console.log(thing)

        // Start task
        switch (this.runArgs.mode) {
          case 'Test':
            this.testFlow()
            break
          default:
            this.testFlow()
            break
        }

        return callback ? callback({ success: true }) : true
      } else {
        return callback ? callback({ success: false, err: 'Already Started'}) : false
      }
    } catch (err) {
      console.error(err)
      return callback ? callback({ success: false, err: 'Catch Full' }) : false
    }
  }
}

module.exports = TEST_SITE

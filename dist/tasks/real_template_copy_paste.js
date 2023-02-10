'use strict';

const Promise = require("bluebird");
const Task = require("./");
const Akamai = require('./akamai.js')

Promise.config({
    cancellation: true,
    longStackTraces: true
});

class TEMPLATE extends Task {
    constructor({ id, group, profile, runArgs, productArgs, loginArgs, webhookArgs, sendStatusMessage, solveCaptcha, getNokamai, getPixel, getInitialFingerprint, getSharedResource, setPrioritySharedResource, openBrowser, orderCallback, requestNewProxy, request, sendAnalytic }) {
        super({id, group, profile, runArgs, productArgs, loginArgs, webhookArgs, sendStatusMessage, solveCaptcha, getNokamai, getPixel, getInitialFingerprint, getSharedResource, setPrioritySharedResource, openBrowser, orderCallback, requestNewProxy, request, sendAnalytic});

        this.variables.static.userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36";

        switch (this.runArgs.site) {
            case "NBA_STORE":
                this.variables.static.host = 'store.nba.com'
                break;
        }

    }

    initializeSession() {
        return new Promise(async (resolve, reject, onCancel) => {
            let cancelled = false;
            onCancel(() => { cancelled = true; });
            try {
                this.sendStatusMessage({id: this.id, msg: `Initializing Session [${this.variables.static.proxy}]`, status: "status"})

                if (cancelled || !this.state.started || this.state.stopped) return;

                this.request({
                    url: '',
                    method: '',
                    headers: {

                    },
                    cookieJar: this.variables.static.cookieJar,
                    proxy: this.runArgs.proxy.current.parsed,
                    body: ''
                }, async (err, res) => {
                    if (cancelled || !this.state.started || this.state.stopped) return;
                    try {
                        if (err) {
                            console.log(err);
                            this.sendStatusMessage({id: this.id, msg: `Error Initializing Session (Request)`, status: "warning"});
                            return reject();
                        } else {
                            if (res.statusCode === 200) {
                                this.sendStatusMessage({id: this.id, msg: 'Initialized Session', status: 'success'})
                                return resolve();
                            } else {
                                this.sendStatusMessage({id: this.id, msg: `Error Initializing Session (Status ${res.statusCode})`, status: "warning"});
                                return reject();
                            }
                        }
                    } catch (err) {
                        this.sendStatusMessage({id: this.id, msg: `Error Initializing Session (Catch Request)`, status: "warning"});
                        return reject();
                    }
                })
            } catch (err) {
                this.sendStatusMessage({id: this.id, msg: `Error Initializing Session (Catch Full)`, status: "warning"});
                return reject();
            }
        })
    }

    cardFlow() {
        const task = this;
        const initializeSessionWrapper = async () => {
            task.state.promises["initializeSession"] = task.initializeSession().then(async () => {
                await task.monitorDelay();
            }).catch((err) => { task.state.timeouts["initializeSession"] = setTimeout(initializeSessionWrapper, task.runArgs.retry_delay); })
        }
        initializeSessionWrapper();
    } 

    async startTask(callback) {
        try {
            if (!this.state.started && this.state.stopped) {

                // Update state
                this.state.started = true;
                this.state.stopped = false;

                // Initialize the group's proxy
                await this.requestNewProxy({id: this.id})

                // Start task
                switch (this.runArgs.mode) {
                    case "Card":
                        this.cardFlow();
                        break;
                    default:
                        this.cardFlow();
                        break;
                }
                
                return callback ? callback({success: true}) : true;
            } else {
                return callback ? callback({success: false, err: 'Already Started'}) : false;
            }
        } catch (err) {
            // console.error(err)
            return callback ? callback({success: false, err: 'Catch Full'}) : false;
        }
    }

}

module.exports = TEMPLATE;
'use strict';

const Promise = require("bluebird");
const Task = require("./");
const fs = require("fs");
const TwoCaptcha = require('./twocaptcha.js')
const Capmonster = require('./capmonster.js')
const Akamai = require('./akamai.js')
const { YEEZYSUPPLY_CAPTCHA, YEEZYSUPPLY_CAPTCHA_SPECIAL } = require('../task-manager/shared_resource_types.js')

Promise.config({
    cancellation: true,
    longStackTraces: true
});

class TEMPLATE extends Task {
    constructor({ id, group, profile, runArgs, productArgs, loginArgs, webhookArgs, sendStatusMessage, solveCaptcha, getNokamai, getPixel, getInitialFingerprint, getSharedResource, setPrioritySharedResource, openBrowser, orderCallback, requestNewProxy, request, sendAnalytic }) {
        super({id, group, profile, runArgs, productArgs, loginArgs, webhookArgs, sendStatusMessage, solveCaptcha, getNokamai, getPixel, getInitialFingerprint, getSharedResource, setPrioritySharedResource, openBrowser, orderCallback, requestNewProxy, request, sendAnalytic});

        this.variables.static.userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36";
        this.variables.static.proxy = "true";

        // this.variables.static.capmonster = new Capmonster(this)
        // this.variables.static.akamai = new Akamai({parent: this, max: 5, useApiUserAgent: true, validation: () => false})

        switch (this.runArgs.site) {
            case "TEMPLATE_SITE":
                this.variables.static.host = "example.com";
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
                    url: `https://www.httpbin.org/get`,
                    method: "GET",
                    headers: {
                        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                        'accept-encoding': 'gzip, deflate, br',
                        'accept-language': 'en-US,en;q=0.9',
                        'cache-control': 'no-cache',
                        'pragma': 'no-cache',
                        'sec-fetch-dest': 'document',
                        'sec-fetch-mode': 'navigate',
                        'sec-fetch-site': 'none',
                        'sec-fetch-user': '?1',
                        'upgrade-insecure-requests': '1',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36'                
                    },
                    cookieJar: this.variables.static.cookieJar,
                    proxy: this.runArgs.proxy.current.parsed
                }, async (err, res) => {
                    if (cancelled || !this.state.started || this.state.stopped) return;
                    try {
                        if (err) {
                            console.log(err);
                            this.sendStatusMessage({id: this.id, msg: `Error Initializing Session (Request)`, status: "warning"});
                            return reject();
                        } else {
                            if (res.headers.hasOwnProperty("set-cookie")) { this.variables.static.cookieJar.addCookies(res.headers["set-cookie"]); };
                            if (res.statusCode === 200) {
                                console.log(res)
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
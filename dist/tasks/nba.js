'use strict';

const Promise = require("bluebird");
const { TimeoutSettings } = require("puppeteer");
const Task = require("./");
const Akamai = require('./akamai.js')

Promise.config({
    cancellation: true,
    longStackTraces: true
});

class TEMPLATE extends Task {
    constructor({ id, group, profile, runArgs, productArgs, loginArgs, webhookArgs, sendStatusMessage, solveCaptcha, getNokamai, getPixel, getInitialFingerprint, getSharedResource, setPrioritySharedResource, openBrowser, orderCallback, requestNewProxy, request, sendAnalytic }) {
        super({id, group, profile, runArgs, productArgs, loginArgs, webhookArgs, sendStatusMessage, solveCaptcha, getNokamai, getPixel, getInitialFingerprint, getSharedResource, setPrioritySharedResource, openBrowser, orderCallback, requestNewProxy, request, sendAnalytic});

        this.variables.static.userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36";

        switch (this.runArgs.site) {
            case "NBA_STORE":
                this.variables.static.host = 'store.nba.com'
                break;
        }

    }

    monitorProduct() {
        return new Promise(async (resolve, reject, onCancel) => {
            let cancelled = false;
            onCancel(() => { cancelled = true; });
            try {
                this.sendStatusMessage({id: this.id, msg: `Monitoring`, status: "status"})

                const data = new URLSearchParams({
                    pageSize: 24,
                    sortOption: 'NewestArrivals',
                    query: this.productArgs.pid
                });

                if (cancelled || !this.state.started || this.state.stopped) return;

                this.request({
                    url: `https://store.nba.com/?${data}`,
                    method: 'GET',
                    headers: {
                        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                        'accept-encoding': 'gzip, deflate, br',
                        'accept-language': 'en-US,en;q=0.9',
                        'cache-control': 'no-cache',
                        'pragma': 'no-cache',
                        'referer': 'https://store.nba.com/',
                        'sec-ch-ua': '" Not;A Brand";v="99", "Google Chrome";v="97", "Chromium";v="97"',
                        'sec-ch-ua-mobile': '?0',
                        'sec-ch-ua-platform': '"Windows"',
                        'sec-fetch-dest': 'document',
                        'sec-fetch-mode': 'navigate',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-user': '?1',
                        'upgrade-insecure-requests': '1',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36'
                    },
                    cookieJar: this.variables.static.cookieJar,
                    proxy: this.runArgs.proxy.current.parsed,
                }, async (err, res) => {
                    if (cancelled || !this.state.started || this.state.stopped) return;
                    try {
                        if (err) {
                            this.sendStatusMessage({id: this.id, msg: `Error Monitoring (Request)`, status: "warning"});
                            return reject();
                        } else {
                            if (res.statusCode === 200) {
                                const productData = /(<script>)(.*?)(window|var|let|const)(.*?)(__platform_data__)(.*?)(=)(.*?)(({)(.*)(}))(<\/script>)/.exec(res.body)?.[9]

                                if (productData) {
                                    const resJSON = JSON.parse(productData)
                                
                                    const product = resJSON?.['browse-data']?.products?.find(product => product.title.toLowerCase().includes(this.productArgs.pid))

                                    if (product) {
                                        this.variables.dynamic.productId = product.id
                                        this.variables.dynamic.productUrl = product.url
                                    } else {
                                        this.sendStatusMessage({id: this.id, msg: 'Product Not Found', status: 'warning'})
                                        return reject()    
                                    }
                                } else {
                                    this.sendStatusMessage({id: this.id, msg: 'Error Monitoring (No Data Found)', status: 'warning'})
                                    return reject()
                                }
                            } else {
                                this.sendStatusMessage({id: this.id, msg: `Error Monitoring (Status ${res.statusCode})`, status: "warning"});
                                return reject();
                            }
                        }
                    } catch (err) {
                        this.sendStatusMessage({id: this.id, msg: `Error Monitoring (Catch Request)`, status: "warning"});
                        return reject();
                    }
                })
            } catch (err) {
                this.sendStatusMessage({id: this.id, msg: `Error Monitoring (Catch Full)`, status: "warning"});
                return reject();
            }
        })
    }

    getProductPage() {
        return new Promise(async (resolve, reject, onCancel) => {
            let cancelled = false;
            onCancel(() => { cancelled = true; });
            try {
                this.sendStatusMessage({id: this.id, msg: `Getting Product Page`, status: "status"})

                if (cancelled || !this.state.started || this.state.stopped) return;

                this.request({
                    url: this.productArgs.pid,
                    method: 'GET',
                    headers: {
                        
                    }
                }, async (err, res) => {
                    try {
                        if (err) {
                            this.sendStatusMessage({id: this.id, msg: 'Error Getting Product Page (Request)', status: 'warning'})
                            return reject()
                        } else {
                            if (res.statusCode === 200) {
                                
                            } else {
                                this.sendStatusMessage({id: this.id, msg: `Error Getting Product Page (Status ${res.statusCode})`, status: 'warning'})
                                return reject()
                            }
                        }    
                    } catch (err) {
                        this.sendStatusMessage({id: this.id, msg: `Error Getting Product Page (Catch Request)`, status: "warning"})
                        return reject()
                    }
                })
            } catch (err) {
                this.sendStatusMessage({id: this.id, msg: 'Error Getting Product Page (Catch Full)', status: 'warning'})
                return reject()
            }
        })
    }


    cardFlow() {
        const task = this;
        const monitorProductWrapper = async () => {
            task.state.promises["monitorProduct"] = task.monitorProduct().then(async () => {
                await task.monitorDelay();
            }).catch((err) => { task.state.timeouts["monitorProduct"] = setTimeout(monitorProductWrapper, task.runArgs.retry_delay); })
        }
        monitorProductWrapper();
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
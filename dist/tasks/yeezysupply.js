'use strict';

const Promise = require("bluebird");
const Task = require("./");
const AdyenEncrypt = require("./adyen.js");
const cheerio = require("cheerio");
const fs = require("fs");
const Akamai = require("./akamai.js");
const { YEEZYSUPPLY_CAPTCHA, YEEZYSUPPLY_CAPTCHA_SPECIAL } = require('../task-manager/shared_resource_types')
 
Promise.config({
    cancellation: true,
    longStackTraces: true
});

/**
 * Modes: "Queue", "No Queue"
 */

class YEEZYSUPPLY extends Task {
    constructor({ id, group, profile, runArgs, productArgs, loginArgs, webhookArgs, sendStatusMessage, liveVariable, solveCaptcha, getNokamai, getPixel, getInitialFingerprint, getSharedResource, setPrioritySharedResource, openBrowser, orderCallback, requestNewProxy, request, sendAnalytic }) {
        super({id, group, profile, runArgs, productArgs, loginArgs, webhookArgs, sendStatusMessage, liveVariable, solveCaptcha, getNokamai, getPixel, getInitialFingerprint, getSharedResource, setPrioritySharedResource, openBrowser, orderCallback, requestNewProxy, request, sendAnalytic});

        this.variables.static.host = "www.yeezysupply.com";
        if (runArgs.mode === 'Adidas') this.variables.static.host = 'www.adidas.fr'

        this.variables.static.adyenEncryptionKey = this.liveVariable(this.runArgs.mode === 'Adidas' ? 'ADIDAS_ADYEN_ENCRYPTION_KEY' : 'YEEZYSUPPLY_ADYEN_ENCRYPTION_KEY', (oldValue, newValue) => {
            try {
                this.variables.static.adyen = new AdyenEncrypt({
                    key: newValue,
                    version: this.variables.static.adyenEncryptionVersion.value
                })
            } catch (err) {
                console.error('Error In Live Variable Callback for Adyen Encryption Key: ', err)
            }
        })

        this.variables.static.adyenEncryptionVersion = this.liveVariable(this.runArgs.mode === 'Adidas' ? 'ADIDAS_ADYEN_ENCRYPTION_VERSION' : 'YEEZYSUPPLY_ADYEN_ENCRYPTION_VERSION', (oldValue, newValue) => {
            try {
                this.variables.static.adyen = new AdyenEncrypt({
                    key: this.variables.static.adyenEncryptionKey.value,
                    version: newValue
                })
            } catch (err) {
                console.error('Error In Live Variable Callback for Adyen Encryption Key: ', err)
            }
        })

        this.variables.static.adyen = new AdyenEncrypt({
            key: this.variables.static.adyenEncryptionKey.value,
            version: this.variables.static.adyenEncryptionVersion.value
        })

        this.variables.static.recaptchaApiKey = this.liveVariable('YEEZYSUPPLY_RECAPTCHA_KEY');
        this.variables.static.recaptchaAction = this.liveVariable('YEEZYSUPPLY_RECAPTCHA_ACTION')
        this.variables.static.phoenix = this.liveVariable('YEEZYSUPPLY_PHOENIX_COOKIE_VALUE')
        this.variables.static.queuePollEndpoint = this.liveVariable('YEEZYSUPPLY_QUEUE_POLL_ENDPOINT')
        this.variables.static.queueCookieName = this.liveVariable('YEEZYSUPPLY_QUEUE_COOKIE_NAME')

        this.variables.static.akamai = new Akamai({parent: this, max: 25, useApiUserAgent: true, validation: this.akamaiValidationScheme})
        
        this.variables.static.userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";
    }

    akamaiValidationScheme = (cookie, body) => this.runArgs.mode === 'Adidas' ? !cookie.includes('==') && !cookie.includes('||') : (cookie.includes('~0~') && !cookie.includes('||')) || cookie.includes('==') && !cookie.includes('||')

    getProductPage() {
        return new Promise(async (resolve, reject, onCancel) => {
            let cancelled = false;
            onCancel(() => { cancelled = true; });
            try {
                // Initialize the fingerprint, and use the fingerprint's user agent prior to sending a request to yeezysupply, to provide fingerprint consistency between all subsequent requests
                try {
                    // Clear cookies to fetch a new initial pixel script on the initial request
                    this.variables.static.cookieJar.clearCookies()
                    
                    // Get a fingerprint once if not present
                    if (!this.variables.static.akamai.user_agent) {
                        await this.variables.static.akamai.setInitialFingerprint()
                        this.variables.static.akamai.updateTaskUserAgent()    
                    }
                } catch (err) {
                    return reject()
                }

                this.sendStatusMessage({id: this.id, msg: `Getting Product Page`, status: "status"});

                if (cancelled || !this.state.started || this.state.stopped) return;

                this.request({
                    url: this.runArgs.mode === 'Adidas' ? `https://www.adidas.fr/socquettes-techfit/${this.productArgs.pid}.html` : `https://${this.variables.static.host}/product/${this.productArgs.pid}`,
                    method: "GET",
                    headers: {
                        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                        "accept-encoding": "gzip, deflate, br",
                        "accept-language": "en-US,en;q=0.9",
                        "cache-control": "no-cache",
                        "pragma": "no-cache",
                        "referer": `https://${this.variables.static.host}/`,
                        "sec-ch-ua": '"Chromium";v="94", "Google Chrome";v="94", ";Not A Brand";v="99"',
                        "sec-ch-ua-mobile": "?0",
                        'sec-ch-ua-platform': '"Windows"',
                        "sec-fetch-dest": "document",
                        "sec-fetch-mode": "navigate",
                        "sec-fetch-site": "none",
                        "sec-fetch-user": "?1",
                        "upgrade-insecure-requests": "1",
                        "user-agent": this.variables.static.userAgent
                    },
                    cookieJar: this.variables.static.cookieJar,
                    proxy: this.runArgs.proxy.current.parsed,
                    log: true,
                    id: this.id
                }, async (err, res) => {
                    if (cancelled || !this.state.started || this.state.stopped) return;
                    try {
                        if (err) {
                            this.sendStatusMessage({id: this.id, msg: `Error Getting Product Page (Request)`, status: "warning"});
                            return reject();
                        } else {
                            if (res.statusCode === 200 && !res.body.includes("HTTP 403 - Forbidden")) {
                                const $ = cheerio.load(res.body);

                                // The akamai script should be the last script on the page, set the akamai endpoint to the last script's src attribute, it shouldn't be the last script if there is a queue
                                const akamaiScript = $('script[type="text/javascript"]').last()[0]
                                this.variables.static.akamai.setEndpoint(new URL(`https://${this.variables.static.host}/${akamaiScript.attribs.src.substr(1, akamaiScript.attribs.src.length)}`))

                                $(`script[type="text/javascript"]`).each((i, script) => {
                                    if (script.attribs.src) {
                                        // Find the queue script
                                        if (/(wrgen_orig_assets)(\/)(.*?)(\.js)/.test(script.attribs.src)) this.variables.dynamic.queueScript = new URL(`https://${this.variables.static.host}/${script.attribs.src.substr(1, script.attribs.src.length)}`);
                                        // Find the akamai pixel script
                                        if (/\/akam\/[0-9]+\//.test(script.attribs.src)) this.variables.static.akamai.setPixelEndpoint(new URL(script.attribs.src))
                                    }
                                })

                                // Set the pixel id parameter used in generation, assuming the pixel id will always be found upon first request
                                const pixelId = /(bazadebezolkohpepadr)(.*?)(=)(.*?)("|'|`)(.*?)("|'|`)/.exec(res.body)[6]
                                this.variables.static.akamai.setPixelId(pixelId)

                                try {
                                    // Generate pixel, assuming the pixel script should always be found upon the first request
                                    await this.variables.static.akamai.generatePixel()
                                } catch (err) {
                                    return reject()
                                }
                                

                                // If the queue script is found, enable queue
                                if (this.variables.dynamic.queueScript) {
                                    this.variables.dynamic.queue = true
                                } else this.variables.dynamic.queue = false

                                return resolve()

                            } else if (res.statusCode === 200 && res.body.includes("HTTP 403 - Forbidden")) {
                                this.sendStatusMessage({id: this.id, msg: `Error Getting Product Page (Proxy Blocked)`, status: "warning"});
                                this.variables.static.cookieJar.deleteCookies(["_abck"])
                                return reject();
                            }  else if (res.statusCode === 403 && res.headers["server"] === "AkamaiGHost") {
                                await this.variables.static.akamai.generate()
                                return reject();
                            } else {
                                this.sendStatusMessage({id: this.id, msg: `Error Getting Product Page (Status ${res.statusCode})`, status: "warning"});
                                return reject();
                            }
                        }
                    } catch (err) {
                        this.sendStatusMessage({id: this.id, msg: `Error Getting Product Page (Catch Request)`, status: "warning"});
                        return reject();
                    }
                })
            } catch (err) {
                this.sendStatusMessage({id: this.id, msg: `Error Getting Product Page (Catch Full)`, status: "warning"});
                return reject();
            }
        })

    }

    getQueueScript() {
        return new Promise(async (resolve, reject, onCancel) => {
            let cancelled = false;
            onCancel(() => { cancelled = true; });
            try {
                this.sendStatusMessage({id: this.id, msg: `Getting Queue Script`, status: "status"});

                if (cancelled || !this.state.started || this.state.stopped) return;

                this.request({
                    url: this.variables.dynamic.queueScript,
                    method: "GET",
                    headers: {
                        "accept": "*/*",
                        "accept-encoding": "gzip, deflate, br",
                        "accept-language": "en-US,en;q=0.9",
                        "cache-control": "no-cache",
                        "pragma": "no-cache",
                        "referer": `https://${this.variables.static.host}/product/${this.productArgs.pid}`,
                        "sec-ch-ua": ",Not;A,Brand;v=99, Google,Chrome;v=91, Chromium;v=91",
                        "sec-ch-ua-mobile": "?0",
                        "sec-fetch-dest": "script",
                        "sec-fetch-mode": "no-cors",
                        "sec-fetch-site": "same-origin",
                        "user-agent": this.variables.static.userAgent
                    },
                    cookieJar: this.variables.static.cookieJar,
                    proxy: this.runArgs.proxy.current.parsed,
                    log: true,
                    id: this.id
                }, async (err, res) => {
                    if (cancelled || !this.state.started || this.state.stopped) return;
                    try {
                        if (err) {
                            this.sendStatusMessage({id: this.id, msg: `Error Getting Queue Script (Request)`, status: "warning"});
                            return reject();
                        } else {
                            if (res.statusCode === 200 && !res.body.includes("HTTP 403 - Forbidden")) {
                                this.variables.static.queueCookieName.value = /(document\.cookie)(.*?)((""|''|``)\.concat\(")(.*?)("|'|`)/.exec(res.body)[5];
                                if (this.variables.static.queueCookieName.value) {
                                    return resolve();
                                } else {
                                    this.sendStatusMessage({id: this.id, msg: "Recaptcha Queue Cookie Name Not Found", status: "warning"})
                                }
                            } else if (res.statusCode === 200 && res.body.includes("HTTP 403 - Forbidden")) {
                                this.sendStatusMessage({id: this.id, msg: `Error Getting Queue Script (Proxy Blocked)`, status: "warning"});
                                this.variables.static.cookieJar.deleteCookies(["_abck"])
                                return reject();
                            }  else if (res.statusCode === 403 && res.headers["server"] === "AkamaiGHost") {
                                await this.variables.static.akamai.generate()
                                return reject();
                            } else {
                                this.sendStatusMessage({id: this.id, msg: `Error Getting Queue Script (Status ${res.statusCode})`, status: "warning"});
                                return reject();
                            }
                        }
                    } catch (err) {
                        this.sendStatusMessage({id: this.id, msg: `Error Getting Queue Script (Catch Request)`, status: "warning"});
                        return reject();
                    }
                })
            } catch (err) {
                this.sendStatusMessage({id: this.id, msg: `Error Getting Queue Script (Catch Full)`, status: "warning"});
                return reject();
            }
        })
    }
    
    pollQueue() {
        return new Promise(async (resolve, reject, onCancel) => {
            let cancelled = false;
            onCancel(() => { cancelled = true; });
            try {
                this.sendStatusMessage({id: this.id, msg: `Waiting For Captcha`, status: "waiting"});

                let captchaToken, isSpecial = false
                try {
                    if (this.runArgs.mode === 'Special') {
                        captchaToken = await this.getSharedResource({id: this.id, type: YEEZYSUPPLY_CAPTCHA_SPECIAL, initialize: false})

                        if (captchaToken === undefined) {
                            captchaToken = await this.getSharedResource({
                                id: this.id,
                                type: YEEZYSUPPLY_CAPTCHA,
                                limits: [
                                    {
                                        type: 'PER_TIME',
                                        max: 115000
                                    },
                                    {
                                        type: 'PER_USE',
                                        max: 100
                                    }
                                ],
                                params: {type: 'RECAPTCHA_V3_INVISIBLE', url: `https://${this.variables.static.host}/product/${this.productArgs.pid}`, siteKey: this.variables.static.recaptchaApiKey.value, action: this.variables.static.recaptchaAction.value}
                            })
                        } else isSpecial = true
                    } else {
                        captchaToken = await this.getSharedResource({
                            id: this.id,
                            type: YEEZYSUPPLY_CAPTCHA,
                            limits: [
                                {
                                    type: 'PER_TIME',
                                    max: 115000
                                },
                                {
                                    type: 'PER_USE',
                                    max: 100
                                }
                            ],
                            params: {type: 'RECAPTCHA_V3_INVISIBLE', url: `https://${this.variables.static.host}/product/${this.productArgs.pid}`, siteKey: this.variables.static.recaptchaApiKey.value, action: this.variables.static.recaptchaAction.value}
                        })
                    }
                } catch (err) {
                    this.sendStatusMessage({id: this.id, msg: `Error Solving Captcha`, status: "warning"});
                    return reject()
                }

                this.sendStatusMessage({id: this.id, msg: `Checking Queue`, status: "status"});

                this.variables.static.cookieJar.addCookies([`PH0ENIX=${this.variables.static.phoenix.value}; `], 'https://www.yeezysupply.com');
                this.variables.static.cookieJar.addCookies([`${this.variables.static.queueCookieName.value}=${captchaToken}; `], 'https://www.yeezysupply.com');

                if (cancelled || !this.state.started || this.state.stopped) return;

                this.request({
                    url: this.variables.static.queuePollEndpoint.value,
                    method: "GET",
                    headers: {
                        "accept": "application/json, text/plain, */*",
                        "accept-encoding": "gzip, deflate, br",
                        "accept-language": "en-US,en;q=0.9",
                        "user-agent": this.variables.static.userAgent,
                        "referer": `https://${this.variables.static.host}/product/${this.productArgs.pid}`,
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin",
                        "sec-ch-ua": ",Not,A;Brand;v=99, Chromium;v=90, Google,Chrome;v=90",
                        "sec-ch-ua-mobile": "?0",
                    },
                    cookieJar: this.variables.static.cookieJar,
                    proxy: this.runArgs.proxy.current.parsed,
                    log: true,
                    id: this.id
                }, async (err, res) => {
                    if (cancelled || !this.state.started || this.state.stopped) return;
                    try {
                        if (err) {
                            this.sendStatusMessage({id: this.id, msg: `Error Checking Queue (Request)`, status: "warning"});
                            return reject();
                        } else {
                            if (res.statusCode === 200 && !res.body.toLowerCase().includes('http 403 - forbidden')) {
                                !isSpecial && this.setPrioritySharedResource({
                                    type: YEEZYSUPPLY_CAPTCHA_SPECIAL,
                                    limits: [{
                                        type: 'PER_TIME',
                                        max: 115000
                                    }],
                                    value: captchaToken
                                })

                                return resolve();
                            } else if (res.statusCode.toString().startsWith('3') || res.statusCode === 418) {
                                this.sendStatusMessage({id: this.id, msg: `Waiting In Queue`, status: "status"});
                                return reject();
                            } else if ((res.statusCode === 200 || res.statusCode === 403) && (res.headers["server"] === "AkamaiGHost" || res.headers["server"] === "AkamaiNetStorage")) {
                                this.sendStatusMessage({id: this.id, msg: `Error Checking Queue (Proxy Blocked)`, status: "warning"});
                                return reject();
                            } else {
                                this.sendStatusMessage({id: this.id, msg: `Error Checking Queue (Status ${res.statusCode})`, status: "warning"});
                                return reject();
                            }
                        }
                    } catch (err) {
                        this.sendStatusMessage({id: this.id, msg: `Error Checking Queue (Catch Request)`, status: "warning"});
                        return reject();
                    }
                })
            } catch (err) {
                this.sendStatusMessage({id: this.id, msg: `Error Checking Queue (Catch Full)`, status: "warning"});
                return reject();
            }
        })
    }

    getQueuePass() {
        return new Promise(async (resolve, reject, onCancel) => {
            let cancelled = false;
            onCancel(() => { cancelled = true; });
            try {
                this.sendStatusMessage({id: this.id, msg: `Getting Queue Pass`, status: "status"});

                if (cancelled || !this.state.started || this.state.stopped) return;
                this.request({
                    url: `https://${this.variables.static.host}/product/${this.productArgs.pid}`,
                    method: "GET",
                    headers: {
                        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                        "accept-encoding": "gzip, deflate, br",
                        "accept-language": "en-US,en;q=0.9",
                        "cache-control": "no-cache",
                        "pragma": "no-cache",
                        "sec-ch-ua": ",Not,A;Brand;v=99, Chromium;v=90, Google,Chrome;v=90",
                        "sec-ch-ua-mobile": "?0",
                        "sec-fetch-dest": "document",
                        "sec-fetch-mode": "navigate",
                        "sec-fetch-site": "none",
                        "sec-fetch-user": "?1",
                        "upgrade-insecure-requests": "1",
                        "user-agent": this.variables.static.userAgent
                    },
                    cookieJar: this.variables.static.cookieJar,
                    proxy: this.runArgs.proxy.current.parsed,
                    log: true,
                    id: this.id
                }, async (err, res) => {
                    if (cancelled || !this.state.started || this.state.stopped) return;
                    try {
                        if (err) {
                            this.sendStatusMessage({id: this.id, msg: `Error Getting Queue Pass (Request)`, status: "warning"});
                            return reject();
                        } else {
                            if (res.statusCode === 200 && !res.headers["server"]) {
                                const $ = cheerio.load(res.body);

                                // The akamai script should be the last script on the page, set the akamai endpoint to the last script's src attribute
                                const akamaiScript = $('script[type="text/javascript"]').last()[0]
                                this.variables.static.akamai.setEndpoint(new URL(`https://${this.variables.static.host}/${akamaiScript.attribs.src.substr(1, akamaiScript.attribs.src.length)}`))
                                
                                if (akamaiScript) {
                                    // Initialize akamai script
                                    await this.variables.static.akamai.initializeScript()
                                    return resolve()
                                } else {
                                    this.sendStatusMessage({id: this.id, msg: `Error Getting Queue Pass (Script Not Found)`, status: "warning"});
                                    return reject()
                                }
                            } else if (res.statusCode === 200 && res.body.includes("HTTP 403 - Forbidden")) {
                                this.sendStatusMessage({id: this.id, msg: `Error Getting Queue Pass (Proxy Blocked)`, status: "warning"});
                                this.variables.static.cookieJar.deleteCookies(["_abck"])
                                return reject();
                            } else if (res.statusCode === 200 || res.statusCode === 404) {
                                this.sendStatusMessage({id: this.id, msg: `Product Not Found`, status: "warning"});
                                return reject();
                            } else if (res.statusCode === 403 && res.headers["server"] === "AkamaiGHost") {
                                await this.variables.static.akamai.generate()
                                return reject();
                            } else {
                                this.sendStatusMessage({id: this.id, msg: `Error Getting Queue Pass (Status ${res.statusCode})`, status: "warning"});
                                return reject();
                            }
                        }
                    } catch (err) {
                        this.sendStatusMessage({id: this.id, msg: `Error Getting Queue Pass (Catch Request)`, status: "warning"});
                        return reject();
                    }
                })
            } catch (err) {
                this.sendStatusMessage({id: this.id, msg: `Error Getting Queue Pass (Catch Full)`, status: "warning"});
                return reject();
            }
        })
    }

    solveQueue() {
        const task = this;
        return new Promise((resolve) => {
            const getQueueScriptWrapper = () => {
                task.state.promises["getQueueScript"] = task.getQueueScript().then(() => {
                    const pollQueueWrapper = () => {
                        task.state.promises["pollQueue"] = task.pollQueue().then(() => {
                            const getQueuePassWrapper = () => {
                                task.state.promises["getQueuePass"] = task.getQueuePass().then(() => {
                                    return resolve();
                                }).catch((err) => { task.state.timeouts["getQueuePass"] = setTimeout(getQueuePassWrapper, 3000) });
                            }
                            getQueuePassWrapper();                        
                        }).catch((err) => { task.state.timeouts["pollQueue"] = setTimeout(pollQueueWrapper, 3000) });
                    }
                    pollQueueWrapper();                
                }).catch((err) => { task.state.timeouts["getQueueScript"] = setTimeout(getQueueScriptWrapper, task.runArgs.retry_delay) });
            }
            getQueueScriptWrapper();
        })
    }

    getProductInfo() {
        return new Promise(async (resolve, reject, onCancel) => {
            let cancelled = false;
            onCancel(() => { cancelled = true; });
            try {
                this.variables.dynamic.queue && await this.solveQueue();

                this.sendStatusMessage({id: this.id, msg: `Getting Product Info`, status: "status"});

                if (cancelled || !this.state.started || this.state.stopped) return;
                this.request({
                    url: `https://${this.variables.static.host}/api/products/${this.productArgs.pid}/availability`,
                    method: "GET",
                    headers: {
                        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                        "accept-encoding": "gzip, deflate, br",
                        "accept-language": "en-US,en;q=0.9",
                        "cache-control": "no-cache",
                        "pragma": "no-cache",
                        "sec-ch-ua": ",Not,A;Brand;v=99, Chromium;v=90, Google,Chrome;v=90",
                        "sec-ch-ua-mobile": "?0",
                        "sec-fetch-dest": "document",
                        "sec-fetch-mode": "navigate",
                        "sec-fetch-site": "none",
                        "sec-fetch-user": "?1",
                        "upgrade-insecure-requests": "1",
                        "user-agent": this.variables.static.userAgent
                    },
                    cookieJar: this.variables.static.cookieJar,
                    proxy: this.runArgs.proxy.current.parsed,
                    log: true,
                    id: this.id
                }, async (err, res) => {
                    if (cancelled || !this.state.started || this.state.stopped) return;
                    try {
                        if (err) {
                            this.sendStatusMessage({id: this.id, msg: `Error Getting Product Info (Request)`, status: "warning"});
                            return reject();
                        } else {
                            if (res.statusCode === 200 && !res.headers["server"]) {
                                const resJSON = JSON.parse(res.body);
                                if (resJSON.availability_status === 'PREVIEW') {
                                    this.sendStatusMessage({id: this.id, msg: 'Product Not Available', status: 'warning'})
                                    return reject()
                                } else {
                                    const sizes = resJSON.variation_list.filter(product => product.availability_status === "IN_STOCK" && this.productArgs.size.some(_size => _size.value === product.size));
                                    if (sizes.length) {
                                        this.variables.dynamic.productId = resJSON.id;
                                        this.variables.dynamic.productSize = sizes[this.randomInt(0, sizes.length - 1)].size;
                                        this.variables.dynamic.sku = sizes[this.randomInt(0, sizes.length - 1)].sku;
                                        return resolve();
                                    } else {
                                        this.sendStatusMessage({id: this.id, msg: `Size Not Found`, status: "warning"});
                                        return reject();
                                    }    
                                }
                            } else if (res.statusCode === 200 && res.body.includes("HTTP 403 - Forbidden")) {
                                this.sendStatusMessage({id: this.id, msg: `Error Getting Product Info (Proxy Blocked)`, status: "warning"});
                                this.variables.static.cookieJar.deleteCookies(["_abck"])
                                return reject();
                            } else if (res.statusCode === 200) {
                                this.sendStatusMessage({id: this.id, msg: `Product Not Found`, status: "warning"});
                                return reject();
                            } else if (res.statusCode === 403 && res.headers["server"] === "AkamaiGHost") {
                                await this.variables.static.akamai.generate()
                                return reject();
                            } else if (res.statusCode === 404) {
                                this.sendStatusMessage({id: this.id, msg: `Product Not Found`, status: 'status'})
                                return reject()
                            } else {
                                this.sendStatusMessage({id: this.id, msg: `Error Getting Product Info (Status ${res.statusCode})`, status: "warning"});
                                return reject();
                            }
                        }
                    } catch (err) {
                        this.sendStatusMessage({id: this.id, msg: `Error Getting Product Info (Catch Request)`, status: "warning"});
                        return reject();
                    }
                })
            } catch (err) {
                this.sendStatusMessage({id: this.id, msg: `Error Getting Product Info (Catch Full)`, status: "warning"});
                return reject();
            }
        })
    }

    addToCart() {
        return new Promise(async (resolve, reject, onCancel) => {
            let cancelled = false;
            onCancel(() => { cancelled = true; });
            try {

                // Attempt to generate akamai prior to adding to cart once
                try {
                    if (this.variables.static.akamai.retries < 1) await this.variables.static.akamai.generate()
                } catch (err) {
                    return reject()
                }

                this.sendStatusMessage({id: this.id, msg: `Adding To Cart`, status: "status", taskUpdates: {size: this.variables.dynamic.productSize}});

                const data = [{
                    "product_id": this.variables.dynamic.productId,
                    "product_variation_sku": this.variables.dynamic.sku,
                    "productId": this.variables.dynamic.sku,
                    "quantity": 1,
                    "size": this.variables.dynamic.productSize,
                    "displaySize": this.variables.dynamic.productSize
                }];

                if (cancelled || !this.state.started || this.state.stopped) return;

                this.request({
                    url: `https://${this.variables.static.host}/api/${this.runArgs.mode === 'Adidas' ? 'chk' : 'checkout'}/baskets/-/items`,
                    method: "POST",
                    headers: {
                        "accept": "*/*",
                        "accept-encoding": "gzip, deflate, br",
                        "accept-language": "en-US,en;q=0.9",
                        "cache-control": "no-cache",
                        "checkout-authorization": "null",
                        "content-type": "application/json",
                        "origin": `https://${this.variables.static.host}`,
                        "pragma": "no-cache",
                        "referer": `https://${this.variables.static.host}/product/${this.productArgs.pid}`,
                        "sec-ch-ua": ",Not,A;Brand;v=99, Chromium;v=90, Google,Chrome;v=90",
                        "sec-ch-ua-mobile": "?0",
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin",
                        "user-agent": this.variables.static.userAgent
                    },
                    cookieJar: this.variables.static.cookieJar,
                    proxy: this.runArgs.proxy.current.parsed,
                    body: JSON.stringify(data),
                    log: true,
                    id: this.id
                }, async (err, res) => {
                    if (cancelled || !this.state.started || this.state.stopped) return;
                    try {
                        if (err) {
                            this.sendStatusMessage({id: this.id, msg: `Error Adding To Cart (Request)`, status: "warning"});
                            return reject();
                        } else {
                            if (res.statusCode === 200 && !res.headers["server"]) {
                                const resJSON = JSON.parse(res.body);
                                const shipmentItem = resJSON.shipmentList.find(shipment => shipment.productLineItemList && shipment.productLineItemList.find(product => product.productId === this.variables.dynamic.sku))
                                if (resJSON.shipmentList && shipmentItem) {
                                    this.variables.dynamic.checkoutAuthorization = res.headers["authorization"];
                                    this.variables.dynamic.basketId = resJSON.basketId;
                                    this.variables.dynamic.shippingId = shipmentItem.shippingLineItem.id;
                                    
                                    try {
                                        this.sendStatusMessage({id: this.id, taskUpdates: {product: shipmentItem.productLineItemList[0].productName}})
                                        this.webhookArgs.name = shipmentItem.productLineItemList[0].productName;
                                        this.webhookArgs.price = resJSON.pricing.total;
                                        this.webhookArgs.size = this.variables.dynamic.productSize;
                                        this.webhookArgs.product = this.productArgs.pid;
                                        this.webhookArgs.image = shipmentItem.productLineItemList[0].productImage;
                                        this.webhookArgs.generated = true
                                    } catch (err) {}
                                    return resolve();
                                } else {
                                    this.sendStatusMessage({id: this.id, msg: `Out Of Stock (Size ${this.variables.dynamic.productSize})`, status: "warning"});
                                    return reject();    
                                }
                            } else if (res.statusCode === 200 && res.body.includes("HTTP 403 - Forbidden")) {
                                this.sendStatusMessage({id: this.id, msg: `Error Adding To Cart (Proxy Blocked)`, status: "warning"});
                                this.variables.static.cookieJar.deleteCookies(["_abck"])
                                return reject();
                            } else if (res.statusCode === 403 && res.headers["server"] === "AkamaiGHost") {
                                await this.variables.static.akamai.generate()
                                return reject();
                            } else {
                                this.sendStatusMessage({id: this.id, msg: `Error Adding To Cart (Status ${res.statusCode})`, status: "warning"});
                                return reject();
                            }
                        }
                    } catch (err) {
                        this.sendStatusMessage({id: this.id, msg: `Error Adding To Cart (Catch Request)`, status: "warning"});
                        return reject();
                    }
                })
            } catch (err) {
                this.sendStatusMessage({id: this.id, msg: `Error Adding To Cart (Catch Full)`, status: "warning"});
                return reject();
            }
        })
    }

    submitInfo() {
        return new Promise(async (resolve, reject, onCancel) => {
            let cancelled = false;
            onCancel(() => { cancelled = true; });
            try {
                this.sendStatusMessage({id: this.id, msg: `Submitting Info`, status: "status"});

                const data = {
                    "customer": {
                        "email": this.profile.email_address,
                        "receiveSmsUpdates": false
                    },
                    "shippingAddress": {
                        "country": this.profile.shipping_country.value,
                        "firstName": this.profile.shipping_first_name,
                        "lastName": this.profile.shipping_last_name,
                        "address1": this.profile.shipping_address_line_1,
                        "address2": this.profile.shipping_address_line_2,
                        "city": this.profile.shipping_city,
                        "stateCode": this.profile.shipping_state.value,
                        "zipcode": this.profile.shipping_zip_code,
                        "phoneNumber": this.profile.phone_number
                    },
                    "billingAddress": {
                        "country": this.profile.billing_country.value,
                        "emailAddress": this.profile.email_address,
                        "firstName": this.profile.billing_first_name,
                        "lastName": this.profile.billing_last_name,
                        "address1": this.profile.billing_address_line_1,
                        "address2": this.profile.billing_address_line_2,
                        "city": this.profile.billing_city,
                        "stateCode": this.profile.billing_state.value,
                        "zipcode": this.profile.billing_zip_code,
                        "phoneNumber": this.profile.phone_number
                    },
                    "methodList": [{
                        "id": this.variables.dynamic.shippingId,
                        "shipmentId": "me",
                        "collectionPeriod": "",
                        "deliveryPeriod": ""
                    }],
                    "newsletterSubscription": true
                };

                if (cancelled || !this.state.started || this.state.stopped) return;

                this.request({
                    url: `https://${this.variables.static.host}/api/${this.runArgs.mode === 'Adidas' ? 'chk' : 'checkout'}/baskets/${this.variables.dynamic.basketId}`,
                    method: "PATCH",
                    headers: {
                        "accept": "*/*",
                        "accept-encoding": "gzip, deflate, br",
                        "accept-language": "en-US,en;q=0.9",
                        "cache-control": "no-cache",
                        "checkout-authorization": this.variables.dynamic.checkoutAuthorization,
                        "content-type": "application/json",
                        "origin": `https://${this.variables.static.host}`,
                        "pragma": "no-cache",
                        "referer": `https://${this.variables.static.host}/delivery`,
                        "sec-ch-ua": ",Not,A;Brand;v=99, Chromium;v=90, Google,Chrome;v=90",
                        "sec-ch-ua-mobile": "?0",
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin",
                        "user-agent": this.variables.static.userAgent
                    },
                    cookieJar: this.variables.static.cookieJar,
                    proxy: this.runArgs.proxy.current.parsed,
                    body: this.runArgs.mode === 'Adidas' ? JSON.stringify(
                        {
                            "customer": {
                                "email": "xbamboodles@yahoo.com",
                                "receiveSmsUpdates": false
                            },
                            "shippingAddress": {
                                "emailAddress": "xbamboodles@yahoo.com",
                                "country": "FR",
                                "address1": "8 Rue du Général Alain de Boissieu",
                                "zipcode": "75015",
                                "city": "Paris",
                                "firstName": "Monsiuer Con",
                                "lastName": "Endrom"
                            },
                            "billingAddress": {
                                "emailAddress": "xbamboodles@yahoo.com",
                                "country": "FR",
                                "address1": "8 Rue du Général Alain de Boissieu",
                                "zipcode": "75015",
                                "city": "Paris",
                                "firstName": "Monsiuer Con",
                                "lastName": "Endrom"
                            },
                            "newsletterSubscription": false,
                            "consentVersion": "ADIBV_VER_20191003_FR_FR",
                            "methodList": [{
                                "id": "Standard-EFC-2",
                                "shipmentId": "me",
                                "carrierCode": "CHR",
                                "carrierServiceCode": "CHR000FR0600000353",
                                "shipNode": "0625",
                                "collectionPeriod": "2021-08-30T14:30:00.000Z,2021-08-30T14:30:00.000Z",
                                "deliveryPeriod": "2021-08-31T08:00:00.000Z,2021-08-31T18:00:00.000Z"
                            }]
                    }) : JSON.stringify(data),
                    log: true,
                    id: this.id
                }, async (err, res) => {
                    if (cancelled || !this.state.started || this.state.stopped) return;
                    try {
                        if (err) {
                            this.sendStatusMessage({id: this.id, msg: `Error Submitting Info (Request)`, status: "warning"});
                            return reject();
                        } else {
                            if (res.statusCode === 200 && !res.headers["server"]) {
                                const resJSON = JSON.parse(res.body);
                                if (resJSON.shippingAddress && resJSON.billingAddress) {
                                    this.variables.dynamic.basketModifiedDate = resJSON.modifiedDate;
                                    return resolve();
                                } else {
                                    this.sendStatusMessage({id: this.id, msg: `Error Submitting Info (Check Info)`, status: "warning"});
                                    return reject();    
                                }
                            } else if (res.statusCode === 200 && res.body.includes("HTTP 403 - Forbidden")) {
                                this.sendStatusMessage({id: this.id, msg: `Error Submitting Info (Proxy Blocked)`, status: "warning"});
                                this.variables.static.cookieJar.deleteCookies(["_abck"])
                                return reject();
                            } else if (res.statusCode === 403 && res.headers["server"] === "AkamaiGHost") {
                                await this.variables.static.akamai.generate()
                                return reject();
                            } else {
                                this.sendStatusMessage({id: this.id, msg: `Error Submitting Info (Status ${res.statusCode})`, status: "warning"});
                                return reject();
                            }
                        }
                    } catch (err) {
                        this.sendStatusMessage({id: this.id, msg: `Error Submitting Info (Catch Request)`, status: "warning"});
                        return reject();
                    }
                })
            } catch (err) {
                this.sendStatusMessage({id: this.id, msg: `Error Submitting Info (Catch Full)`, status: "warning"});
                return reject();
            }
        })
    }

    submitPayment() {
        return new Promise(async (resolve, reject, onCancel) => {
            let cancelled = false;
            onCancel(() => { cancelled = true; });
            try {
                this.sendStatusMessage({id: this.id, msg: `Submitting Payment`, status: "status"});

                const encryptedInstrument = this.variables.static.adyen.encrypt({
                    number: this.profile.card_number,
                    cvc: this.profile.card_security_code,
                    holderName: this.profile.card_name,
                    expiryMonth: this.profile.card_expiry_month.value,
                    expiryYear: this.profile.card_expiry_year.value,
                    generationtime: this.variables.dynamic.basketModifiedDate,
                    paymentMethodId: "CREDIT_CARD",
                    cardType: this.profile.card_type.toUpperCase()
                })

                const data = {
                    "basketId": this.variables.dynamic.basketId,
                    "encryptedInstrument": encryptedInstrument,
                    "fingerprint": "ryEGX8eZpJ0030000000000000bsx09CX6tD0050271576cVB94iKzBGAGkRpZZGx75S16Goh5Mk004w7hYyfhAaY00000qZkTE00000wr58nMb7jDEC4FlSABmQ:40",
                    "paymentInstrument": {
                        "cardType": this.profile.card_type.toUpperCase(),
                        "expirationMonth": parseInt(this.profile.card_expiry_month.value),
                        "expirationYear": parseInt(this.profile.card_expiry_year.value),
                        "holder": this.profile.card_name,
                        "lastFour": this.profile.card_number.slice(this.profile.card_number.length - 4, this.profile.card_number.length),
                        "paymentMethodId": "CREDIT_CARD",
                    }
                };

                if (cancelled || !this.state.started || this.state.stopped) return;

                this.request({
                    url: `https://${this.variables.static.host}/api/${this.runArgs.mode === 'Adidas' ? 'chk' : 'checkout'}/orders`,
                    method: "POST",
                    headers: {
                        "accept": "*/*",
                        "accept-encoding": "gzip, deflate, br",
                        "accept-language": "en-US,en;q=0.9",
                        "cache-control": "no-cache",
                        "checkout-authorization": this.variables.dynamic.checkoutAuthorization,
                        "content-type": "application/json",
                        "origin": `https://${this.variables.static.host}`,
                        "pragma": "no-cache",
                        "referer": `https://${this.variables.static.host}/payment`,
                        "sec-ch-ua": ",Not,A;Brand;v=99, Chromium;v=90, Google,Chrome;v=90",
                        "sec-ch-ua-mobile": "?0",
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin",
                        "user-agent": this.variables.static.userAgent
                    },
                    cookieJar: this.variables.static.cookieJar,
                    proxy: this.runArgs.proxy.current.parsed,
                    body: JSON.stringify(data),
                    log: true,
                    id: this.id
                }, async (err, res) => {
                    if (cancelled || !this.state.started || this.state.stopped) return;
                    try {
                        if (err) {
                            this.sendStatusMessage({id: this.id, msg: `Error Submitting Payment (Request)`, status: "warning"});
                            return reject();
                        } else {
                            if (res.statusCode.toString().startsWith('2') && !res.headers["server"]) {
                                const resJSON = JSON.parse(res.body)
                                if (resJSON.authorizationType !== '3ds') {
                                    this.sendStatusMessage({id: this.id, msg: 'Checked Out', status: 'success'})
                                    try {
                                        // Order callback stops task
                                        this.orderCallback({order: {
                                            type: 'success',
                                            id: this.runArgs.mode === 'Adidas' ? /AFR([0-9]{8})/i.exec(res.body)[0] : /AYS([0-9]{8})/i.exec(res.body)[0],
                                            profile: this.profile.profile_name,
                                            proxy: this.runArgs.proxy.name,
                                            email: this.profile.email_address,
                                            price: this.webhookArgs.price,
                                            size: this.webhookArgs.size,
                                            product: this.webhookArgs.product,
                                            name: this.webhookArgs.name,
                                            image: this.webhookArgs.image
                                        }, taskId: this.id})
                                    } catch (err) {
                                        this.stopTask()
                                    }
                                } else {
                                    this.variables.dynamic.paRedirectForm = resJSON.paRedirectForm
                                    this.variables.dynamic.orderId = resJSON.orderId
                                    this.variables.dynamic.TermUrl = `https://${this.variables.static.host}/payment/callback/CREDIT_CARD/${this.variables.dynamic.basketId}/adyen?orderId=${this.variables.dynamic.orderId}&encodedData=${resJSON.paRedirectForm.formFields.EncodedData}`
                                    this.variables.dynamic.MD = resJSON.paRedirectForm.formFields.MD
                                    this.variables.dynamic.PaReq = resJSON.paRedirectForm.formFields.PaReq
                                    this.variables.dynamic.encodedData = resJSON.paRedirectForm.formFields.EncodedData
                                    return resolve()
                                }
                            } else if (res.statusCode === 400) {
                                this.sendStatusMessage({id: this.id, msg: 'Payment Declined', status: 'error'})
                                try {
                                    // Order callback stops task
                                    this.orderCallback({order: {
                                        type: 'decline',
                                        id: this.runArgs.mode === 'Adidas' ? /AFR([0-9]{8})/i.exec(res.body)[0] : /AYS([0-9]{8})/i.exec(res.body)[0],
                                        profile: this.profile.profile_name,
                                        proxy: this.runArgs.proxy.name,
                                        email: this.profile.email_address,
                                        price: this.webhookArgs.price,
                                        size: this.webhookArgs.size,
                                        product: this.webhookArgs.product,
                                        name: this.webhookArgs.name,
                                        image: this.webhookArgs.image
                                    }, taskId: this.id})
                                } catch (err) {
                                    this.stopTask()
                                }
                            } else if (res.statusCode === 200 && res.body.includes("HTTP 403 - Forbidden")) {
                                this.sendStatusMessage({id: this.id, msg: `Error Submitting Payment (Proxy Blocked)`, status: "warning"});
                                this.variables.static.cookieJar.deleteCookies(["_abck"])
                                return reject();
                            } else if (res.statusCode === 403 && res.headers["server"] === "AkamaiGHost") {
                                await this.variables.static.akamai.generate()
                                return reject();
                            } else {
                                this.sendStatusMessage({id: this.id, msg: `Error Submitting Payment (Status ${res.statusCode})`, status: "warning"});
                                return reject();
                            }
                        }
                    } catch (err) {
                        this.sendStatusMessage({id: this.id, msg: `Error Submitting Payment (Catch Request)`, status: "warning"});
                        return reject();
                    }
                })
            } catch (err) {
                this.sendStatusMessage({id: this.id, msg: `Error Submitting Payment (Catch Full)`, status: "warning"});
                return reject();
            }
        })
    }

    get3DS() {
        return new Promise(async (resolve, reject, onCancel) => {
            let cancelled = false;
            onCancel(() => { cancelled = true; });
            try {
                this.sendStatusMessage({id: this.id, msg: `Getting 3DS`, status: "status"});

                const data = new URLSearchParams({
                    PaReq: this.variables.dynamic.PaReq,
                    MD: this.variables.dynamic.MD,
                    TermUrl: this.variables.dynamic.TermUrl
                })
                
                if (cancelled || !this.state.started || this.state.stopped) return;

                this.request({
                    url: this.variables.dynamic.paRedirectForm.formAction,
                    method: this.variables.dynamic.paRedirectForm.formMethod,
                    headers: {
                        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                        'accept-encoding': 'gzip, deflate, br',
                        'accept-language': 'en-US,en;q=0.9',
                        'cache-control': 'no-cache',
                        'connection': 'keep-alive',
                        'content-type': 'application/x-www-form-urlencoded',
                        'host': new URL(this.variables.dynamic.paRedirectForm.formAction).host,
                        'origin': `https://${this.variables.static.host}`,
                        'pragma': 'no-cache',
                        'referer': `https://${this.variables.static.host}/`,
                        'sec-ch-ua': '"Chromium";v="92", " Not A;Brand";v="99", "Google Chrome";v="92"',
                        'sec-ch-ua-mobile': '?0',
                        'sec-fetch-dest': 'document',
                        'sec-fetch-mode': 'navigate',
                        'sec-fetch-site': 'cross-site',
                        'upgrade-insecure-requests': '1',
                        'user-agent': this.variables.static.userAgent,
                    },
                    cookieJar: this.variables.static.cookieJar,
                    proxy: this.runArgs.proxy.current.parsed,
                    body: data.toString(),
                    log: true,
                    id: this.id
                }, async (err, res) => {
                    if (cancelled || !this.state.started || this.state.stopped) return;
                    try {
                        if (err) {
                            this.sendStatusMessage({id: this.id, msg: `Error Getting 3DS (Request)`, status: "warning"});
                            return reject();
                        } else {
                            if (res.statusCode === 200) {
                                if (/(body(.*?)onload=('|"|`)document\.forms\[0\].submit\(\);('|"|`)>)/gm.test(res.body)) {
                                    this.variables.dynamic.PaRes = /('|"|`)(PaRes)('|"|`)(.*?)(value)(.*?)('|"|`)(.*?)('|"|`)/gmi.exec(res.body)[8]
                                } else {
                                    this.sendStatusMessage({id: this.id, msg: 'Waiting For 3DS', status: 'waiting'})
                                    try {
                                        ({ PaRes: this.variables.dynamic.PaRes } = await this.openBrowser({
                                                type: 'YEEZYSUPPLY_3DS',
                                                url: this.variables.dynamic.paRedirectForm.formAction,
                                                content: res.body,
                                                user_agent: this.variables.static.userAgent,
                                                proxy: this.runArgs.proxy
                                        }))    
                                    } catch (err) {
                                        this.sendStatusMessage({id: this.id, msg: 'Error Waiting For 3DS', status: 'error'})
                                        return reject()
                                    }
                                }

                                if (this.variables.dynamic.PaRes) return resolve()
                                else {
                                    this.sendStatusMessage({id: this.id, msg: `Error Getting 3DS (Not Found)`, status: 'warning'})
                                    return reject()
                                }
                            } else {
                                this.sendStatusMessage({id: this.id, msg: `Error Getting 3DS (Status ${res.statusCode})`, status: 'warning'})
                                return reject()
                            }
                        }
                    } catch (err) {
                        this.sendStatusMessage({id: this.id, msg: `Error Getting 3DS (Catch Request)`, status: "warning"});
                        return reject();
                    }
                })
            } catch (err) {
                this.sendStatusMessage({id: this.id, msg: `Error Getting 3DS (Catch Full)`, status: "warning"});
                return reject();
            }
        })
    }

    submit3DS() {
        return new Promise(async (resolve, reject, onCancel) => {
            let cancelled = false;
            onCancel(() => { cancelled = true; });
            try {
                this.sendStatusMessage({id: this.id, msg: `Submitting 3DS`, status: "status"});

                const data = new URLSearchParams({
                    PaRes: this.variables.dynamic.PaRes,
                    MD: this.variables.dynamic.MD
                })

                if (cancelled || !this.state.started || this.state.stopped) return;

                this.request({
                    url: `${this.variables.dynamic.TermUrl}&result=AUTHORISED`,
                    method: 'POST',
                    headers: {
                        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                        'accept-encoding': 'gzip, deflate, br',
                        'accept-language': 'en-US,en;q=0.9',
                        'cache-control': 'no-cache',
                        'connection': 'keep-alive',
                        'content-type': 'application/x-www-form-urlencoded',
                        'origin': `https://${new URL(this.variables.dynamic.paRedirectForm.formAction).host}`,
                        'pragma': 'no-cache',
                        'referer': `https://${new URL(this.variables.dynamic.paRedirectForm.formAction).host}/`,
                        'sec-ch-ua': '"Chromium";v="92", " Not A;Brand";v="99", "Google Chrome";v="92"',
                        'sec-ch-ua-mobile': '?0',
                        'sec-fetch-dest': 'document',
                        'sec-fetch-mode': 'navigate',
                        'sec-fetch-site': 'cross-site',
                        'upgrade-insecure-requests': '1',
                        'user-agent': this.variables.static.userAgent,
                    },
                    cookieJar: this.variables.static.cookieJar,
                    proxy: this.runArgs.proxy.current.parsed,
                    body: data.toString(),
                    log: true,
                    id: this.id
                }, async (err, res) => {
                    if (cancelled || !this.state.started || this.state.stopped) return;
                    try {
                        if (err) {
                            this.sendStatusMessage({id: this.id, msg: `Error Submitting 3DS (Request)`, status: "warning"});
                            return reject();
                        } else {
                            if (res.statusCode === 200) {
                                return resolve()
                            } else {
                                this.sendStatusMessage({id: this.id, msg: `Error Submitting 3DS (Status ${res.statusCode})`, status: 'warning'})
                                return reject()
                            }
                        }
                    } catch (err) {
                        this.sendStatusMessage({id: this.id, msg: `Error Submitting 3DS (Catch Request)`, status: "warning"});
                        return reject();
                    }
                })
            } catch (err) {
                this.sendStatusMessage({id: this.id, msg: `Error Submitting 3DS (Catch Full)`, status: "warning"});
                return reject();
            }
        })
    }

    finalize3DS() {
        return new Promise(async (resolve, reject, onCancel) => {
            let cancelled = false;
            onCancel(() => { cancelled = true; });
            try {
                this.sendStatusMessage({id: this.id, msg: `Finalizing 3DS`, status: "status"});

                const data = {
                    'orderId': this.variables.dynamic.orderId,
                    'MD': this.variables.dynamic.MD,
                    'PaRes': this.variables.dynamic.PaRes
                }

                if (cancelled || !this.state.started || this.state.stopped) return;

                this.request({
                    url: `https://${this.variables.static.host}/api/${this.runArgs.mode === 'Adidas'? 'chk' : 'checkout'}/payment-verification/${this.variables.dynamic.encodedData}`,
                    method: 'POST',
                    headers: {
                        "accept": "*/*",
                        "accept-encoding": "gzip, deflate, br",
                        "accept-language": "en-US,en;q=0.9",
                        "cache-control": "no-cache",
                        "checkout-authorization": this.variables.dynamic.checkoutAuthorization,
                        "content-type": "application/json",
                        "origin": `https://${this.variables.static.host}`,
                        "pragma": "no-cache",
                        "referer": this.variables.dynamic.TermUrl,
                        "sec-ch-ua": ",Not,A;Brand;v=99, Chromium;v=90, Google,Chrome;v=90",
                        "sec-ch-ua-mobile": "?0",
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin",
                        "user-agent": this.variables.static.userAgent
                    },
                    cookieJar: this.variables.static.cookieJar,
                    proxy: this.runArgs.proxy.current.parsed,
                    body: JSON.stringify(data),
                    log: true,
                    id: this.id
                }, async (err, res) => {
                    if (cancelled || !this.state.started || this.state.stopped) return;
                    try {
                        if (err) {
                            this.sendStatusMessage({id: this.id, msg: `Error Finalizing 3DS (Request)`, status: "warning"});
                            return reject();
                        } else {
                            if (res.statusCode === 200) {
                                this.sendStatusMessage({id: this.id, msg: 'Checked Out', status: 'success'})
                                try {
                                    this.orderCallback({order: {
                                        type: 'success',
                                        id: this.variables.dynamic.orderId,
                                        profile: this.profile.profile_name,
                                        proxy: this.runArgs.proxy.name,
                                        email: this.profile.email_address,
                                        price: this.webhookArgs.price,
                                        size: this.webhookArgs.size,
                                        product: this.webhookArgs.product,
                                        name: this.webhookArgs.name,
                                        image: this.webhookArgs.image
                                    }, taskId: this.id})
                                } catch (err) {
                                    this.stopTask()
                                }
                            } else {
                                this.sendStatusMessage({id: this.id, msg: `Error Finalizing 3DS (Status ${res.statusCode})`, status: 'warning'})
                            }
                        }
                    } catch (err) {
                        this.sendStatusMessage({id: this.id, msg: `Error Finalizing 3DS (Catch Request)`, status: "warning"});
                        return reject();
                    }
                })
            } catch (err) {
                this.sendStatusMessage({id: this.id, msg: `Error Finalizing 3DS (Catch Full)`, status: "warning"});
                return reject();
            }
        })
    }

    cardFlow() {
        const task = this;
        const getProductPageWrapper = async () => {
            task.state.promises["getProductPage"] = task.getProductPage().then(async () => {
                await task.monitorDelay();
                    const getProductInfoWrapper = async () => {
                        task.state.promises["getProductInfo"] = task.getProductInfo().then(async () => {
                            await task.monitorDelay();
                            const addToCartWrapper = async () => {
                                task.state.promises["addToCart"] = task.addToCart().then(async () => {
                                    await task.monitorDelay();
                                    const submitInfoWrapper = async () => {
                                        task.state.promises["submitInfo"] = task.submitInfo().then(async () => {
                                            await task.monitorDelay();
                                            const submitPaymentWrapper = async () => {
                                                task.state.promises["submitPayment"] = task.submitPayment().then(async () => {
                                                    await task.monitorDelay();
                                                    const get3DSWrapper = async () => {
                                                        task.state.promises["get3DS"] = task.get3DS().then(async () => {
                                                            const submit3DSWrapper = async () => {
                                                                task.state.promises["submit3DS"] = task.submit3DS().then(async () => {
                                                                    const finalize3DSWrapper = async () => {
                                                                        task.state.promises["finalize3DS"] = task.finalize3DS().then(async () => {
                                                                            await task.monitorDelay();
                                                                        }).catch((err) => { task.state.timeouts["finalize3DS"] = setTimeout(finalize3DSWrapper, task.runArgs.retry_delay); })
                                                                    }
                                                                    finalize3DSWrapper();
                                                                }).catch((err) => { task.state.timeouts["submit3DS"] = setTimeout(submit3DSWrapper, task.runArgs.retry_delay); })
                                                            }
                                                            submit3DSWrapper();
                                                        }).catch((err) => { task.state.timeouts["get3DS"] = setTimeout(get3DSWrapper, task.runArgs.retry_delay); })
                                                    }
                                                    get3DSWrapper();        
                                                }).catch((err) => { task.state.timeouts["submitPayment"] = setTimeout(submitPaymentWrapper, task.runArgs.retry_delay); })
                                            }
                                            submitPaymentWrapper();        
                                        }).catch((err) => { task.state.timeouts["submitInfo"] = setTimeout(submitInfoWrapper, task.runArgs.retry_delay); })
                                    }
                                    submitInfoWrapper();
                                }).catch((err) => { task.state.timeouts["addToCart"] = setTimeout(addToCartWrapper, task.runArgs.retry_delay); })
                            }
                        addToCartWrapper();
                    }).catch((err) => { task.state.timeouts["getProductInfo"] = setTimeout(getProductInfoWrapper, task.runArgs.retry_delay); })
                }
                getProductInfoWrapper();        
            }).catch((err) => { task.state.timeouts["getProductPage"] = setTimeout(getProductPageWrapper, task.runArgs.retry_delay); })
        }
        getProductPageWrapper();
    }

    startTask(callback) {
        try {
            if (!this.state.started && this.state.stopped) {
                // Update state
                this.state.started = true;
                this.state.stopped = false;

                this.requestNewProxy({id: this.id});

                // Start task
                switch (this.runArgs.mode) {
                    default:
                        this.cardFlow();
                        break;
                }
                
                return callback ? callback({success: true}) : true;
            } else {
                return callback ? callback({success: false, err: 'Already Started'}) : false;
            }
        } catch (err) {
            console.error(err)
            return callback ? callback({success: false, err: 'Catch Full'}) : false;
        }
    }

}

module.exports = YEEZYSUPPLY;
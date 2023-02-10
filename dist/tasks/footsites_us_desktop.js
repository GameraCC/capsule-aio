'use strict';

const Promise = require("bluebird");
const Task = require("./");
const Akamai = require("./akamai.js");
const CookieJar = require("./capsuleCookie.js");
const AdyenEncrypt = require("./adyen.js");
const TwoCaptcha = require('./twocaptcha.js')
const Capmonster = require('./capmonster.js')
const crypto = require("crypto");

Promise.config({
    cancellation: true,
    longStackTraces: true
});

class US_FOOTSITES extends Task {
    constructor({id, group, profile, runArgs, productArgs, loginArgs, webhookArgs, sendStatusMessage, liveVariable, solveCaptcha, getNokamai, getPixel, getInitialFingerprint, getSharedResource, setPrioritySharedResource, orderCallback, requestNewProxy, request, sendAnalytic}) {
        super({id, group, profile, runArgs, productArgs, loginArgs, webhookArgs, sendStatusMessage, liveVariable, solveCaptcha, getNokamai, getPixel, getInitialFingerprint, getSharedResource, setPrioritySharedResource, orderCallback, requestNewProxy, request, sendAnalytic});

        if (runArgs.twocaptcha.enabled || runArgs.capmonster.enabled) this.variables.static.automatedCaptcha = runArgs.twocaptcha.enabled ? new TwoCaptcha(this) : new Capmonster(this)

        this.variables.static.userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36";

        switch (this.runArgs.site) {
            case "FOOTLOCKER_US_DESKTOP":
                this.variables.static.host =  this.liveVariable('FOOTLOCKER_US_DESKTOP_HOST') // "www.footlocker.com";
                this.variables.static.tokenizationKey = this.liveVariable('FOOTLOCKER_US_DESKTOP_TOKENIZATION_KEY') // "production_4xv869xf_rfbkw27jcwmw2xgp";
                this.variables.static.siteCode = this.liveVariable('FOOTLOCKER_US_DESKTOP_SITE_CODE') // 'FL'
                this.variables.static.apiVersion = this.liveVariable('FOOTLOCKER_US_DESKTOP_API_VERSION') // 'v3'
                this.variables.static.datadome = this.liveVariable('FOOTLOCKER_US_DESKTOP_DATADOME_ENABLED') // true
                break;
            case "FOOTLOCKER_CA_DESKTOP":
                this.variables.static.host = this.liveVariable('FOOTLOCKER_CA_DESKTOP_HOST')// "www.footlocker.ca";
                this.variables.static.tokenizationKey = this.liveVariable('FOOTLOCKER_CA_DESKTOP_TOKENIZATION_KEY')// "production_6m67wxmk_rfbkw27jcwmw2xgp";
                this.variables.static.siteCode = this.liveVariable('FOOTLOCKER_CA_DESKTOP_SITE_CODE')//'FLCA'
                this.variables.static.apiVersion = this.liveVariable('FOOTLOCKER_CA_DESKTOP_API_VERSION')//'v4'
                this.variables.static.datadome = this.liveVariable('FOOTLOCKER_CA_DESKTOP_DATADOME_ENABLED')//true;
                break;
            case "CHAMPSSPORTS_US_DESKTOP":
                this.variables.static.host = this.liveVariable('CHAMPSSPORTS_US_DESKTOP_HOST')//"www.champssports.com";
                this.variables.static.tokenizationKey = this.liveVariable('CHAMPSSPORTS_US_DESKTOP_TOKENIZATION_KEY')//"production_jy33mby8_rfbkw27jcwmw2xgp";
                this.variables.static.siteCode = this.liveVariable('CHAMPSSPORTS_US_DESKTOP_SITE_CODE')//'CS'
                this.variables.static.apiVersion = this.liveVariable('CHAMPSSPORTS_US_DESKTOP_API_VERSION')//'v3'
                this.variables.static.datadome = this.liveVariable('CHAMPSSPORTS_US_DESKTOP_DATADOME_ENABLED')// true;
                break;
            case "EASTBAY_US_DESKTOP":
                this.variables.static.host = this.liveVariable('EASTBAY_US_DESKTOP_HOST')//"www.eastbay.com";
                this.variables.static.tokenizationKey = this.liveVariable('EASTBAY_US_DESKTOP_TOKENIZATION_KEY')// "production_tvsmgfv9_rfbkw27jcwmw2xgp";
                this.variables.static.siteCode = this.liveVariable('EASTBAY_US_DESKTOP_SITE_CODE')//'EB'
                this.variables.static.apiVersion = this.liveVariable('EASTBAY_US_DESKTOP_API_VERSION')//'v3'
                this.variables.static.datadome = this.liveVariable('EASTBAY_US_DESKTOP_DATADOME_ENABLED') // true;
                break;
            case "FOOTACTION_US_DESKTOP":
                this.variables.static.host = this.liveVariable('FOOTACTION_US_DESKTOP_HOST')//"www.footaction.com";
                this.variables.static.tokenizationKey = this.liveVariable('FOOTACTION_US_DESKTOP_TOKENIZATION_KEY')//"production_ykv84pk6_rfbkw27jcwmw2xgp";
                this.variables.static.siteCode = this.liveVariable('FOOTACTION_US_DESKTOP_SITE_CODE')//'FA'
                this.variables.static.apiVersion = this.liveVariable('FOOTACTION_US_DESKTOP_API_VERSION')//'v3'
                this.variables.static.datadome = this.liveVariable('FOOTACTION_US_DESKTOP_DATADOME_ENABLED')//true;
                break;
            case "KIDSFOOTLOCKER_US_DESKTOP":
                this.variables.static.host = this.liveVariable('KIDSFOOTLOCKER_US_DESKTOP_HOST')//"www.kidsfootlocker.com";
                this.variables.static.tokenizationKey = this.liveVariable('KIDSFOOTLOCKER_US_DESKTOP_TOKENIZATION_KEY')// "production_5rqkfrrj_rfbkw27jcwmw2xgp";
                this.variables.static.siteCode = this.liveVariable('KIDSFOOTLOCKER_US_DESKTOP_SITE_CODE')//'KFL'
                this.variables.static.apiVersion = this.liveVariable('KIDSFOOTLOCKER_US_DESKTOP_API_VERSION')//'v3'
                this.variables.static.datadome = this.liveVariable('KIDSFOOTLOCKER_US_DESKTOP_DATADOME_ENABLED')// true;
                break;
            default:
                this.variables.static.host =  this.liveVariable('FOOTLOCKER_US_DESKTOP_HOST') // "www.footlocker.com";
                this.variables.static.tokenizationKey = this.liveVariable('FOOTLOCKER_US_DESKTOP_TOKENIZATION_KEY') // "production_4xv869xf_rfbkw27jcwmw2xgp";
                this.variables.static.siteCode = this.liveVariable('FOOTLOCKER_US_DESKTOP_SITE_CODE') // 'FL'
                this.variables.static.apiVersion = this.liveVariable('FOOTLOCKER_US_DESKTOP_API_VERSION') // 'v3'
                this.variables.static.datadome = this.liveVariable('FOOTLOCKER_US_DESKTOP_DATADOME_ENABLED') // true
                break;
        }

        !this.variables.static.datadome.value && (this.variables.static.akamai = new Akamai({endpoint: `https://${this.variables.static.host.value}/_bm/_data`, validation: this.akamaiValidVerification, useApiUserAgent: true, parent: this, max: 5, request: this.request}));

        this.variables.static.paypalErrorHandlers = [
            {code: "ACCOUNT_ALREADY_EXISTS", message: "Paypal Account Already Exists"},
            {code: "BANK_GENERIC_ERROR", message: "Generic Bank Error"},
            {code: "BANK_LINKED_TO_FULL_ACCOUNT", message: "Bank Already Linked To Full Account"},
            {code: "BIN_BLOCKED_OR_CARD_NOT_ALLOWED", message: "Bank / Card Blocked or Not Allowed"},
            {code: "CANNOT_PAY_SELF", message: "Cannot Pay Self"},
            {code: "CARD_GENERIC_ERROR", message: "Generic Card Error"},
            {code: "CC_INVALID_CSC", message: "Invalid Card Security Code"},
            {code: "CC_LINKED", message: "Card Linked Already"},
            {code: "CC_LINKED_TO_FULL_ACCOUNT", message: "Card Already Linked To Full Account"},
            {code: "CHECK_DIGITS_REJECTED", message: "Invalid Card Security Code"},
            {code: "COUNTRY_NOT_SUPPORTED", message: "Country Not Supported"},
            {code: "CREATE_CARD_ACCOUNT_CANDIDATE_VALIDATION_ERROR", message: "Profile Card / Address Error"},
            {code: "EXPIRED_CARD", message: "Card Expired"},
            {code: "EXPIRED_CREDIT_CARD", message: "Card Expired"},
            {code: "INSTRUMENT_DISABLED", message: "Card Disabled"},
            {code: "INSTRUMENT_DUPLICATE_LIMIT_REACHED", message: "Card Duplicate Limit Reached"},
            {code: "INSTRUMENT_REFUSED", message: "Card Refused"},
            {code: "INSTRUMENT_REFUSED_DUE_TO_MAX_LIMIT", message: "Card Refused Due to Max Limit"},
            {code: "INSTRUMENT_SHARING_LIMIT_EXCEEDED", message: "Card Sharing Limit Reached"},
            {code: "INTERNAL_ERROR", message: "Internal Error"},
            {code: "INVALID_CARD_NUMBER", message: "Invalid Card Number"},
            {code: "INVALID_CARD_OR_TYPE", message: "Invalid Card Type"},
            {code: "INVALID_CARD_TYPE", message: "Invalid Card Type"},
            {code: "INVALID_EXPIRATION_DATE", message: "Invalid Expiration Date"},
            {code: "INVALID_EXPIRY", message: "Invalid Expiration Date"},
            {code: "INVALID_INSTRUMENT_ID", message: "Invalid Instrument ID"},
            {code: "INVALID_SECURITY_CODE", message: "Invalid Card Security Code"},
            {code: "ISSUER_REJECTED", message: "Issuer Rejected Card"},
            {code: "ISSUER_RESTRICTED", message: "Issuer Restricted Card"},
            {code: "MAX_AMOUNT_EXCEEDED", message: "Card Limit Exceeded"},
            {code: "NEED_CREDIT_CARD", message: "Need Card"},
            {code: "NEED_CREDIT_CARD_OR_BANK_ACCOUNT", message: "Need Card / Bank"},
            {code: "REJECT_REFUSED", message: "Card Rejected / Rejected"},
            {code: "REJECT_UNKNOWN", message: "Card Rejected Unknown Reason"},
            {code: "RISK_DISALLOWED", message: "Card Not Allowed"},
            {code: "SETTLEMENT_DENIED", message: "Card Settlement Declined"},
            {code: "LOGIN", message: "Email Is Attached To Existing Account"}
        ];

        this.variables.static.adyen = new AdyenEncrypt({
            key: "10001|A237060180D24CDEF3E4E27D828BDB6A13E12C6959820770D7F2C1671DD0AEF4729670C20C6C5967C664D18955058B69549FBE8BF3609EF64832D7C033008A818700A9B0458641C5824F5FCBB9FF83D5A83EBDF079E73B81ACA9CA52FDBCAD7CD9D6A337A4511759FA21E34CD166B9BABD512DB7B2293C0FE48B97CAB3DE8F6F1A8E49C08D23A98E986B8A995A8F382220F06338622631435736FA064AEAC5BD223BAF42AF2B66F1FEA34EF3C297F09C10B364B994EA287A5602ACF153D0B4B09A604B987397684D19DBC5E6FE7E4FFE72390D28D6E21CA3391FA3CAADAD80A729FEF4823F6BE9711D4D51BF4DFCB6A3607686B34ACCE18329D415350FD0654D",
            version: "0_1_18"
        });

        this.variables.static.powPath = 'challengeapi/pow/challenge'
    }

    akamaiValidVerification(cookie) {
        return !cookie.includes("=") && !cookie.includes("||");
    }

    executeChallenge({input, zeroCount}) {
        return new Promise((resolve, reject) => {
            try {
                let zeroes = "";
                for (let i =0; i < zeroCount; i++) {
                    zeroes += "0";
                }
    
                let loop = true;
                let postfix = 0;
                while (loop) {

                    postfix++;
    
                    const hash = crypto.createHash('sha256').update(input).update(postfix.toString()).digest('hex');
    
                    if (hash.indexOf(zeroes) === 0) {
                        loop = false;
                        return resolve({
                            postfix: postfix,
                            hash: hash
                        })
                    }

                }
            } catch (err) {
                return reject();
            }
        })
    }

    getQueueIt() {
        return new Promise(async (resolve, reject, onCancel) => {
            let cancelled = false;
            onCancel(() => { cancelled = true; });
            try {
                this.sendStatusMessage({id: this.id, msg: `Getting Queue`, status: "status"});

                if (cancelled || !this.state.started || this.state.stopped) return;
                this.request({
                    url: this.variables.dynamic.queue.url,
                    method: "POST",
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
                            this.sendStatusMessage({id: this.id, msg: `Error Getting Queue (Request)`, status: "warning"});
                            return reject();
                        }
                        else {
                            if (res.statusCode === 200) {
                                this.variables.dynamic.queue.layout = {
                                    name: /(window\.queue)(.*?)(=)(.*?)(QueueIt)(.*?)({)(.*?)(layout)(.*?)("|'|`)(.*?)("|'|`)/gms.exec(res.body)[12],
                                    version: parseInt(/(window\.queue)(.*?)(=)(.*?)(QueueIt)(.*?)({)(.*?)(layout)(.*?)([0-9]{12})/gms.exec(res.body)[11]),
                                };
                                this.variables.dynamic.queue.challenges = {
                                    recaptcha: /(name)("|'|`)(.*?)("|'|`)(Recaptcha)("|'|`)/gmi.test(res.body),
                                    invisible: /(name)("|'|`)(.*?)("|'|`)(RecaptchaInvisible)("|'|`)/gmi.test(res.body),
                                    pow: /(name)("|'|`)(.*?)("|'|`)(ProofOfWork)("|'|`)/gmi.test(res.body),
                                    botDetect: /(name)("|'|`)(.*?)("|'|`)(BotDetect)("|'|`)/gmi.test(res.body),
                                    endpoint: /(challengeVerifyEndpoint)(.*?)("|'|`)(.*?)("|'|`)/gmi.exec(res.body)[4].substring(1),
                                    captchaInvisiblePublicKey: /(captchaInvisiblePublicKey)(.*?)("|'|`)(.*?)("|'|`)/gmi.exec(res.body)[4],
                                    captchaPublicKey: /(captchaPublicKey)(.*?)("|'|`)(.*?)("|'|`)/gmi.exec(res.body)[4],
                                }
                                return resolve();
                            } else if (res.statusCode === 302 && !res.headers["location"].includes("afterevent")) {
                                this.variables.dynamic.queue = {
                                    url: res.headers["location"],
                                    host: new URL(res.headers["location"]).host,
                                    customerId: new URL(res.headers["location"]).searchParams.get("c"),
                                    eventId: new URL(res.headers["location"]).searchParams.get("e"),
                                    sessions: []
                                }
                                return reject();
                            } else if (res.headers["location"].includes("afterevent")) {
                                this.sendStatusMessage({id: this.id, msg: `Queue Stopped`, status: "error"});
                                this.stopTask();
                                return;
                            } else {
                                this.sendStatusMessage({id: this.id, msg: `Error Getting Queue (Status ${res.statusCode})`, status: "warning"});
                                return reject();
                            }
                        }
                    } catch (err) {
                        this.sendStatusMessage({id: this.id, msg: `Error Getting Queue (Catch Request)`, status: "warning"});
                        return reject();
                    }
                })
            } catch (err) {
                this.sendStatusMessage({id: this.id, msg: `Error Getting Queue (Catch Full)`, status: "warning"});
                return reject();
            }
        })
    }

    getPOWQueueIt() {
        return new Promise(async (resolve, reject, onCancel) => {
            let cancelled = false;
            onCancel(() => { cancelled = true; });
            try {
                this.sendStatusMessage({id: this.id, msg: `Getting POW`, status: "status"});

                this.variables.dynamic.queue.userId = new URLSearchParams(this.variables.static.cookieJar.getCookieValue("Queue-it")).get("u");

                if (cancelled || !this.state.started || this.state.stopped) return;

                this.request({
                    url: `https://${this.variables.dynamic.queue.host}/${this.variables.static.powPath}/${this.variables.dynamic.queue.userId}`,
                    method: "POST",
                    headers: {
                        "accept": "*/*",
                        "accept-encoding": "gzip, deflate, br",
                        "accept-language": "en-US,en;q=0.9",
                        "cache-control": "no-cache",
                        "powtag-customerid": this.variables.dynamic.queue.customerId,
                        "powtag-eventid": this.variables.dynamic.queue.eventId,
                        "powtag-userid": this.variables.dynamic.queue.userId,
                        "pragma": "no-cache",
                        "referer": this.variables.dynamic.queue.url,
                        "origin": `https://${this.variables.dynamic.queue.host}`,
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin",
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
                            this.sendStatusMessage({id: this.id, msg: `Error Getting POW (Request)`, status: "warning"});
                            return reject();
                        } else {
                            if (res.statusCode === 200) {
                                const resJSON = JSON.parse(res.body);
                                this.variables.dynamic.queue.pow = resJSON;
                                return resolve();
                            } else {
                                this.sendStatusMessage({id: this.id, msg: `Error Getting POW (Status ${res.statusCode})`, status: "warning"});
                                return reject();
                            }
                        }
                    } catch (err) {
                        this.sendStatusMessage({id: this.id, msg: `Error Getting POW (Catch Request)`, status: "warning"});
                        return reject();
                    }
                })
            } catch (err) {
                this.sendStatusMessage({id: this.id, msg: `Error Getting POW (Catch Full)`, status: "warning"});
                return reject();
            }
        })
    }

    solvePOWQueueIt() {
        return new Promise(async (resolve, reject, onCancel) => {
            let cancelled = false;
            onCancel(() => { cancelled = true; });
            try {
                this.sendStatusMessage({id: this.id, msg: `Solving POW`, status: "status"});

                /*

                    Dynamic function parsing, not used for MAJOR security issues
                
                    const ast = babel.parse(this.variables.dynamic.queue.pow.function);

                    babel.traverse(ast, {
                        CallExpression(path) {
                            path.node.callee.name === "resolver" &&
                            !path.node.arguments.length &&
                            path.replaceWith(babel.types.callExpression(path.node.callee, [babel.types.memberExpression(babel.types.identifier("session"), babel.types.identifier("solution"))]));
                        }
                    })

                    const executeChallenge = generate.default(ast, {}, this.variables.dynamic.queue.pow.function).code

                */

                const challengeSolution = await this.executeChallenge({input: this.variables.dynamic.queue.pow.parameters.input, zeroCount: this.variables.dynamic.queue.pow.parameters.zeroCount});
                
                const sessionID = Buffer.from(JSON.stringify({
                    "userId": this.variables.dynamic.queue.userId,
                    "meta": this.variables.dynamic.queue.pow.meta,
                    "sessionId": this.variables.dynamic.queue.pow.sessionId,
                    "solution": challengeSolution,
                    "tags": [
                        `powTag-CustomerId:${this.variables.dynamic.queue.customerId}`,
                        `powTag-EventId:${this.variables.dynamic.queue.eventId}`,
                        `powTag-UserId:${this.variables.dynamic.queue.userId}`
                    ],
                    "stats": {
                        "duration": this.randomInt(150, 3000),
                        "tries": 1,
                        "userAgent": this.variables.static.userAgent,
                        "screen": "1920 x 1080",
                        "browser": "Chrome",
                        "browserVersion": /(MSIE|(?!Gecko.+)Firefox|(?!AppleWebKit.+Chrome.+)Safari|(?!AppleWebKit.+)Chrome|AppleWebKit(?!.+Chrome|.+Safari)|Gecko(?!.+Firefox))(?: |\/)([\d\.apre]+)/g.exec(this.variables.static.userAgent)[2],
                        "isMobile": false,
                        "os": "Windows",
                        "osVersion": "10",
                        "cookiesEnabled": true
                    },
                    "parameters": this.variables.dynamic.queue.pow.parameters
                })).toString("base64");

                const data = {
                    "challengeType": "proofofwork",
                    "sessionId": sessionID,
                    "customerId": this.variables.dynamic.queue.customerId,
                    "eventId": this.variables.dynamic.queue.eventId,
                    "version": 5
                };

                if (cancelled || !this.state.started || this.state.stopped) return;

                this.request({
                    url: `https://${this.variables.dynamic.queue.host}/${this.variables.dynamic.queue.challenges.endpoint}`,
                    method: "POST",
                    headers: {
                        "accept": "*/*",
                        "accept-encoding": "gzip, deflate, br",
                        "accept-language": "en-US,en;q=0.9",
                        "cache-control": "no-cache",
                        "content-type": "application/json",
                        "powtag-customerid": `${this.variables.dynamic.queue.customerId}`,
                        "powtag-eventid": `${this.variables.dynamic.queue.eventId}`,
                        "powtag-userid": `${this.variables.dynamic.queue.userId}`,
                        "pragma": "no-cache",
                        "referer": this.variables.dynamic.queue.url,
                        "origin": `https://${this.variables.dynamic.queue.host}`,
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin",
                        "sec-fetch-user": "?1",
                        "upgrade-insecure-requests": "1",
                        "user-agent": `${this.variables.static.userAgent}`
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
                            this.sendStatusMessage({id: this.id, msg: `Error Solving POW (Request)`, status: "warning"});
                            return reject();
                        } else {
                            if (res.statusCode === 200) {
                                const resJSON = JSON.parse(res.body);
                                if (resJSON.isVerified) {
                                    this.variables.dynamic.queue.sessions.push(resJSON.sessionInfo);
                                    return resolve();
                                } else {
                                    this.sendStatusMessage({id: this.id, msg: `Error Solving POW (Not Verified)`, status: "error"});
                                    this.stopTask();
                                    return;
                                }
                            } else {
                                this.sendStatusMessage({id: this.id, msg: `Error Solving POW (Status ${res.statusCode})`, status: "warning"});
                                return reject();
                            }
                        }
                    } catch (err) {
                        this.sendStatusMessage({id: this.id, msg: `Error Solving POW (Catch Request)`, status: "warning"});
                        return reject();
                    }
                })
            } catch (err) {
                this.sendStatusMessage({id: this.id, msg: `Error Solving POW (Catch Full)`, status: "warning"});
                return reject();
            }
        })
    }

    initializeQueueIt() {
        return new Promise(async (resolve, reject, onCancel) => {
            let cancelled = false;
            onCancel(() => { cancelled = true; });
            try {
                this.sendStatusMessage({id: this.id, msg: `Initializing Queue`, status: "status"});

                const data = {
                    "challengeSessions": this.variables.dynamic.queue.sessions,
                    "layoutName": this.variables.dynamic.queue.layout.name,
                    "customUrlParams": "",
                    "targetUrl": `https://${this.variables.static.host.value}/product/~/${this.productArgs.pid}.html`,
                    "Referrer": ""
                };

                if (cancelled || !this.state.started || this.state.stopped) return;

                this.request({
                    url: `https://${this.variables.dynamic.queue.host}/spa-api/queue/${this.variables.dynamic.queue.customerId}/${this.variables.dynamic.queue.eventId}/enqueue?cid=en-US`,
                    method: "POST",
                    headers: {
                        "accept": "application/json, text/javascript, */*; q=0.01",
                        "accept-encoding": "gzip, deflate, br",
                        "accept-language": "en-US,en;q=0.9",
                        "cache-control": "no-cache",
                        "content-type": "application/json",
                        "origin": `https://${this.variables.dynamic.queue.host}`,
                        "pragma": "no-cache",
                        "referer": this.variables.dynamic.queue.host,
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin",
                        "sec-fetch-user": "?1",
                        "upgrade-insecure-requests": "1",
                        "user-agent": this.variables.static.userAgent,
                        "x-requested-with": "XMLHttpRequest"
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
                            this.sendStatusMessage({id: this.id, msg: `Error Initializing Queue (Request)`, status: "warning"});
                            return reject();
                        } else {
                            if (res.statusCode === 200) {
                                const resJSON = JSON.parse(res.body);
                                if (resJSON.queueId) {
                                    this.variables.dynamic.queue.id = resJSON.queueId;
                                    this.variables.dynamic.queue.sessionID = this.randomUUIDV1();
                                    this.variables.dynamic.queue.start = Date.now();
                                    return resolve();    
                                } else {
                                    this.sendStatusMessage({id: this.id, msg: `Queue Not Available`, status: "error"});
                                    this.stopTask();
                                    return;
                                }
                            } else {
                                this.sendStatusMessage({id: this.id, msg: `Error Initializing Queue (Status ${res.statusCode})`, status: "warning"});
                                return reject();
                            }
                        }
                    } catch (err) {
                        this.sendStatusMessage({id: this.id, msg: `Error Initializing Queue (Catch Request)`, status: "warning"});
                        return reject();
                    }
                })
            } catch (err) {
                this.sendStatusMessage({id: this.id, msg: `Error Initializing Queue (Catch Full)`, status: "warning"});
                return reject();
            }
        })

    }

    pollQueueIt() {
        return new Promise(async (resolve, reject, onCancel) => {
            let cancelled = false;
            onCancel(() => { cancelled = true; });
            try {
                this.sendStatusMessage({id: this.id, msg: `Checking Queue`, status: "status"});
                
                const data = {
                    "targetUrl": `https://${this.variables.static.host.value}/product/~/${this.productArgs.pid}.html`,
                    "customUrlParams": "",
                    "layoutVersion": this.variables.dynamic.queue.layout.version,
                    "layoutName": this.variables.dynamic.queue.layout.name,
                    "isClientRedayToRedirect": true,
                    "isBeforeOrIdle": !this.variables.dynamic.queue.started
                };

                if (cancelled || !this.state.started || this.state.stopped) return;

                this.request({
                    url: `https://${this.variables.dynamic.queue.host}/spa-api/queue/${this.variables.dynamic.queue.customerId}/${this.variables.dynamic.queue.eventId}/${this.variables.dynamic.queue.id}/status?cid=en-US&l=${encodeURIComponent(this.variables.dynamic.queue.layout.name)}&seid=${this.variables.dynamic.queue.sessionID}&sets=${this.variables.dynamic.queue.start}`,
                    method: "POST",
                    headers: {
                        "accept": "application/json, text/javascript, */*; q=0.01",
                        "accept-encoding": "gzip, deflate, br",
                        "accept-language": "en-US,en;q=0.9",
                        "cache-control": "no-cache",
                        "content-type": "application/json",
                        "origin": `https://${this.variables.dynamic.queue.host}`,
                        "pragma": "no-cache",
                        "referer": this.variables.dynamic.queue.url,
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin",
                        "sec-fetch-user": "?1",
                        "upgrade-insecure-requests": "1",
                        "user-agent": this.variables.static.userAgent,
                        "x-requested-with": "XMLHttpRequest",
                        ...(this.variables.dynamic.queue.item && {"x-queueit-queueitem-v1": this.variables.dynamic.queue.item})
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
                            this.sendStatusMessage({id: this.id, msg: `Error Checking Queue (Request)`, status: "warning"});
                            return reject();
                        } else {
                            if (res.statusCode === 200) {
                                const resJSON = JSON.parse(res.body);
                                resJSON.isBeforeOrIdle && (this.variables.dynamic.queue.started = resJSON.isBeforeOrIdle);
                                resJSON.updateInterval && (this.variables.dynamic.queue.pollInterval = resJSON.updateInterval);
                                if (resJSON.isRedirectToTarget) {
                                    this.variables.dynamic.queue.redirect = resJSON.redirectUrl;
                                    return resolve();
                                } else if (resJSON.ticket) {
                                    res.headers["x-queueit-queueitem-v1"] && (this.variables.dynamic.queue.item = res.headers["x-queueit-queueitem-v1"]);
                                    this.sendStatusMessage({id: this.id, msg: resJSON.ticket.progress !== null ? `Waiting In Queue [${(resJSON.ticket.progress * 100).toFixed(2)}%]` : `Waiting In Queue [${(Math.round(Date.now() - this.variables.dynamic.queueStart) / 1000).toFixed()}s]`, status: "status"});
                                    return reject();
                                } else {
                                    this.sendStatusMessage({id: this.id, msg: `Queue Not Found`, status: "error"});
                                    this.stopTask();
                                    return;
                                }
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

    finalizeQueueIt() {
        return new Promise(async (resolve, reject, onCancel) => {
            let cancelled = false;
            onCancel(() => { cancelled = true; });
            try {
                this.sendStatusMessage({id: this.id, msg: `Finalizing Queue`, status: "status"});
                
                const data = {
                    "targetUrl": `https://${this.variables.static.host.value}/product/~/${this.productArgs.pid}.html`,
                    "customUrlParams": "",
                    "layoutVersion": this.variables.dynamic.queue.layout.version,
                    "layoutName": this.variables.dynamic.queue.layout.name,
                    "isClientRedayToRedirect": true,
                    "isBeforeOrIdle": !this.variables.dynamic.queue.started
                };

                if (cancelled || !this.state.started || this.state.stopped) return;

                this.request({
                    url: this.variables.dynamic.queue.redirect,
                    method: "GET",
                    headers: {
                        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                        "accept-encoding": "gzip, deflate, br",
                        "accept-language": "en-US,en;q=0.9",
                        "cache-control": "no-cache",
                        "pragma": "no-cache",
                        "referer": `https://${this.variables.dynamic.queue.host}/`,
                        "sec-fetch-dest": "document",
                        "sec-fetch-mode": "navigate",
                        "sec-fetch-site": "cross-site",
                        "upgrade-insecure-requests": "1",
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
                            this.sendStatusMessage({id: this.id, msg: `Error Finalizing Queue (Request)`, status: "warning"});
                            return reject();
                        } else {
                            if (res.headers['set-cookie'] && res.headers['set-cookie'].some(cookie => cookie.startsWith('QueueITAccepted'))) {
                                return resolve();
                            } else {
                                this.sendStatusMessage({id: this.id, msg: `Error Finalizing Queue (Status ${res.statusCode})`, status: "warning"});
                                return reject();
                            }
                        }
                    } catch (err) {
                        this.sendStatusMessage({id: this.id, msg: `Error Finalizing Queue (Catch Request)`, status: "warning"});
                        return reject();
                    }
                })
            } catch (err) {
                this.sendStatusMessage({id: this.id, msg: `Error Finalizing Queue (Catch Full)`, status: "warning"});
                return reject();
            }
        })
    }

    solveInvisibleCaptcha() {
        return new Promise(async (resolve, reject, onCancel) => {
            let cancelled = false;
            onCancel(() => { cancelled = true; });
            try {

                try {
                    // On 500 status error due to sever overloaded with recaptchas being sent, retry sending the same captcha instead of getting a new captcha
                    if (!this.variables.dynamic.retry_same_captcha) {
                        this.sendStatusMessage({id: this.id, msg: 'Waiting For Captcha', status: 'waiting'})
                        if (this.variables.static.automatedCaptcha) {
                            this.variables.dynamic.invisibleCaptchaToken = await this.variables.static.automatedCaptcha.solveCaptcha({type: "RECAPTCHA_V2_INVISIBLE", url: this.variables.dynamic.queue.url, siteKey: this.variables.dynamic.queue.challenges.captchaInvisiblePublicKey})
                        } else {
                            this.variables.dynamic.invisibleCaptchaToken = await this.solveCaptcha({type: "RECAPTCHA_V2_INVISIBLE", url: this.variables.dynamic.queue.url, siteKey: this.variables.dynamic.queue.challenges.captchaInvisiblePublicKey})
                        }    
                    }
                } catch (err) {
                    this.sendStatusMessage({id: this.id, msg: `Error Waiting For Captcha`, status: "warning"});
                    return reject()
                }

                const data = {
                    'challengeType': 'recaptcha-invisible',
                    'sessionId': this.variables.dynamic.invisibleCaptchaToken,
                    'customerId': this.variables.dynamic.queue.customerId,
                    'eventId': this.variables.dynamic.queue.eventId,
                    'version': 5
                }

                this.sendStatusMessage({id: this.id, msg: `Submitting Invisible Captcha`, status: "status"});
                
                if (cancelled || !this.state.started || this.state.stopped) return;

                this.request({
                    url: `https://${this.variables.dynamic.queue.host}/${this.variables.dynamic.queue.challenges.endpoint}`,
                    method: "POST",
                    headers: {
                        "accept": "application/json, text/javascript, */*; q=0.01",
                        "accept-encoding": "gzip, deflate, br",
                        "accept-language": "en-US,en;q=0.9",
                        "content-length": "625",
                        "content-type": "application/json",
                        "origin": `https://${this.variables.dynamic.queue.host}`,
                        "referer": this.variables.dynamic.queue.url,
                        "sec-ch-ua": "Chromium;v=92, ,Not,A;Brand;v=99, Google,Chrome;v=92",
                        "sec-ch-ua-mobile": "?0",
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin",
                        "user-agent": this.variables.static.userAgent,
                        "x-requested-with": "XMLHttpRequest"
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
                            this.sendStatusMessage({id: this.id, msg: `Error Submitting Invisible Captcha (Request)`, status: "warning"});
                            return reject();
                        } else {
                            this.variables.dynamic.retry_same_captcha = false
                            if (res.statusCode === 200) {
                                const resJSON = JSON.parse(res.body)
                                if (resJSON.isVerified) {
                                    this.variables.dynamic.queue.sessions.push(resJSON.sessionInfo)
                                    return resolve()
                                } else {
                                    this.sendStatusMessage({id: this.id, msg: `Error Submitting Invisible Captcha (Not Verified)`, status: "warning"});
                                    return reject()
                                }
                            } else if (res.statusCode === 500) {
                                this.variables.dynamic.retry_same_captcha = true
                                this.sendStatusMessage({id: this.id, msg: `Error Submitting Invisible Captcha (Server Issue)`, status: "warning"});
                                return reject();
                            } else {
                                this.sendStatusMessage({id: this.id, msg: `Error Submitting Invisible Captcha (Status ${res.statusCode})`, status: "warning"});
                                return reject();
                            }
                        }
                    } catch (err) {
                        this.sendStatusMessage({id: this.id, msg: `Error Submitting Invisible Captcha (Catch Request)`, status: "warning"});
                        return reject();
                    }
                })
            } catch (err) {
                this.sendStatusMessage({id: this.id, msg: `Error Submitting Invisible Captcha (Catch Full)`, status: "warning"});
                return reject();
            }
        })
    }

    solvePOW() {
        const task = this
        return new Promise((resolve, reject) => {
            const getPOWQueueItWrapper = () => {
                task.state.promises["getPOWQueueIt"] = task.getPOWQueueIt().then(() => {
                    const solvePOWQueueItWrapper = () => {
                        task.state.promises["solvePOWQueueIt"] = task.solvePOWQueueIt().then(() => {
                            return resolve()
                        }).catch((err) => { task.state.timeouts["solvePOWQueueIt"] = setTimeout(solvePOWQueueItWrapper, this.runArgs.retry_delay); });
                    }
                    solvePOWQueueItWrapper();
                }).catch((err) => { task.state.timeouts["getPOWQueueIt"] = setTimeout(getPOWQueueItWrapper, this.runArgs.retry_delay); });
            }
            getPOWQueueItWrapper();
        })
    }

    solveInvisibleCaptchaTask() {
        const task = this
        return new Promise((resolve, reject) => {
            const solveInvisibleCaptchaWrapper = () => {
                task.state.promises["solveInvisibleCaptcha"] = task.solveInvisibleCaptcha().then(() => {
                    return resolve()
                }).catch((err) => { task.state.timeouts["solveInvisibleCaptcha"] = setTimeout(solveInvisibleCaptchaWrapper, this.runArgs.retry_delay); });
            }
            solveInvisibleCaptchaWrapper();
        })
    }

    solveQueueItChallenges() {
        return new Promise(async (resolve, reject, onCancel) => {
            let cancelled = false;
            onCancel(() => { cancelled = true; });
            try {
                if (this.variables.dynamic.queue.challenges.pow) await this.solvePOW()
                if (this.variables.dynamic.queue.challenges.invisible) await this.solveInvisibleCaptchaTask()

                return resolve()
            } catch (err) {
    
            }    
        })
    }

    solveQueueIt() {
        this.variables.dynamic.queueStart = Date.now();
        const task = this;
        return new Promise(async (resolve, reject) => {
            const getQueueItWrapper = () => {
                task.state.promises["getQueueIt"] = task.getQueueIt().then(() => {
                    const solveQueueItChallengesWrapper = () => {
                        task.state.promises["solveQueueItChallenges"] = task.solveQueueItChallenges().then(() => {
                            const initializeQueueItWrapper = () => {
                                task.state.promises["initializeQueueIt"] = task.initializeQueueIt().then(() => {
                                        const pollQueueItWrapper = () => {
                                            task.state.promises["pollQueueIt"] = task.pollQueueIt().then(() => {
                                                const finalizeQueueItWrapper = () => {
                                                    task.state.promises["finalizeQueueIt"] = task.finalizeQueueIt().then(() => {
                                                        return resolve();
                                                    }).catch((err) => { task.state.timeouts["finalizeQueueIt"] = setTimeout(finalizeQueueItWrapper, this.variables.dynamic.queue.pollInterval); });
                                                }
                                                finalizeQueueItWrapper();
                                            }).catch((err) => { task.state.timeouts["pollQueueIt"] = setTimeout(pollQueueItWrapper, this.variables.dynamic.queue.pollInterval); });
                                        }
                                        pollQueueItWrapper();        
                                    }).catch((err) => { task.state.timeouts["initializeQueueIt"] = setTimeout(initializeQueueItWrapper, this.runArgs.retry_delay); });
                                }
                                initializeQueueItWrapper();            
                        }).catch((err) => { task.state.timeouts["solveQueueItChallenges"] = setTimeout(solveQueueItChallengesWrapper, this.runArgs.retry_delay); });
                    }
                    solveQueueItChallengesWrapper()
                }).catch((err) => { task.state.timeouts["getQueueIt"] = setTimeout(getQueueItWrapper, this.runArgs.retry_delay); });
            }
            getQueueItWrapper();
        })
    }

    pollQueue() {
        return new Promise(async (resolve, reject, onCancel) => {
            let cancelled = false;
            onCancel(() => { cancelled = true; });
            try {
                this.sendStatusMessage({id: this.id, msg: `Checking Queue`, status: "status"})

                if (cancelled || !this.state.started || this.state.stopped) return;

                this.request({
                    url: `https://${this.variables.static.host.value}/`,
                    method: "GET",
                    headers: {
                        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                        "accept-encoding": "gzip, deflate, br",
                        "accept-language": "en-US,en;q=0.9",
                        "cache-control": "max-age=0",
                        "referer": `https://${this.variables.static.host.value}/`,
                        "sec-fetch-site": "same-origin",
                        "sec-fetch-mode": "navigate",
                        "sec-fetch-dest": "document",
                        "upgrade-insecure-requests": "1",
                        "user-agent": this.variables.static.userAgent
                    },
                    cookieJar: this.variables.static.cookieJar,
                    proxy: this.runArgs.proxy.current.parsed,
                    log: true,
                    id: this.id
                }, (err, res) => {
                    if (cancelled || !this.state.started || this.state.stopped) return;
                    try {
                        if (err) {
                            this.sendStatusMessage({id: this.id, msg: `Error Checking Queue (Request)`, status: "warning"})
                            return reject();
                        }
                        else {
                            if (res.statusCode === 200) {
                                return resolve();
                            }
                            else if (res.statusCode === 503) {
                                this.sendStatusMessage({id: this.id, msg: `Waiting In Queue [${(Math.round(Date.now() - this.variables.dynamic.queueStart) / 1000).toFixed(0)}s]`, status: "status"});
                                return reject();
                            }
                            else {
                                this.sendStatusMessage({id: this.id, msg: `Error Checking Queue (Status ${res.statusCode})`, status: "warning"});
                                return reject();
                            }
                        }
                    }
                    catch (err) {
                        this.sendStatusMessage({id: this.id, msg: `Error Checking Queue (Catch Request)`, status: "warning"})
                        return reject();
                    }
                })
            }
            catch (err) {
                this.sendStatusMessage({id: this.id, msg: `Error Checking Queue (Catch Full)`, status: "warning"})
                return reject();
            }
        })
    }


    solveQueue() {
        this.variables.dynamic.queueStart = Date.now();
        const task = this;
        return new Promise(async (resolve, reject) => {
            const pollQueueWrapper = () => {
                task.state.promises["pollQueue"] = task.pollQueue().then(() => {
                    return resolve();
                }).catch((err) => { task.state.timeouts["pollQueue"] = setTimeout(pollQueueWrapper, 5000); });
            }
            pollQueueWrapper();
        })
    }

    getDatadomeCaptcha() {
        return new Promise(async (resolve, reject, onCancel) => {
            let cancelled = false;
            onCancel(() => { cancelled = true; });
            try {
                this.sendStatusMessage({id: this.id, msg: `Getting Datadome`, status: "status"});

                if (!(this.variables.dynamic.initialCid && this.variables.dynamic.hash && this.variables.dynamic.s && this.variables.static.cookieJar.getCookieValue("datadome"))) {
                    this.sendStatusMessage({id: this.id, msg: `Error Getting Datadome (Params)`, status: "error"});
                    this.stopTask();
                    return;
                };

                const data = {
                    "initialCid": this.variables.dynamic.initialCid,
                    "hash": this.variables.dynamic.hash,
                    "s": this.variables.dynamic.s,
                    "cid": this.variables.static.cookieJar.getCookieValue("datadome"),
                    "host": this.variables.static.host.value,
                    "userAgent": this.variables.static.userAgent,
                };

                this.runArgs.api_key = "6vqgf9ybgw1yw7gCtodwc1dq9tjSZ4MSaOJ3XcXm";

                if (cancelled || !this.state.started || this.state.stopped) return;

                this.request({
                    url: `https://api.capsuleaio.com/solve`,
                    method: "POST",
                    headers: {
                        "content-type": "application/json",
                        "x-api-key": `${this.runArgs.api_key}`,
                        "user-agent": `${this.variables.static.userAgent}`
                    },
                    body: JSON.stringify(data)
                }, (err, res) => {
                    if (cancelled || !this.state.started || this.state.stopped) return;
                    try {
                        if (err) {
                            this.sendStatusMessage({id: this.id, msg: `Error Getting Datadome (Request)`, status: "warning"});
                            return reject();
                        } else {
                            if (res.statusCode === 200) {
                                const resJSON = JSON.parse(res.body);
                                this.variables.dynamic.captchaToken = resJSON;
                                return resolve();
                            } else {
                                this.sendStatusMessage({id: this.id, msg: `Error Getting Datadome (Status ${res.statusCode})`, status: "warning"});
                                return reject();        
                            }
                        }
                    } catch (err) {
                        this.sendStatusMessage({id: this.id, msg: `Error Getting Datadome (Catch Request)`, status: "warning"});
                        return reject();
                    }
                })
            } catch (err) {
                this.sendStatusMessage({id: this.id, msg: `Error Getting Datadome (Catch Full)`, status: "warning"});
                return reject();
            }
        })
    }

    submitDatadomeCaptcha() {
        return new Promise(async (resolve, reject, onCancel) => {
            let cancelled = false;
            onCancel(() => { cancelled = true; });
            try {
                this.sendStatusMessage({id: this.id, msg: `Submitting Datadome`, status: "status"});

                /*
                    Possibly change captchaToken parameters before this, x-forwarded-for and parent_url to the geo.captcha-delivery.com url
                */

                const data = new URLSearchParams(this.variables.dynamic.captchaToken);
                
                if (cancelled || !this.state.started || this.state.stopped) return;

                this.request({
                    url: `https://geo.captcha-delivery.com/captcha/check?${data}`,
                    method: "GET",
                    headers: {
                        "accept": "*/*",
                        "accept-encoding": "gzip, deflate, br",
                        "accept-language": "en-US,en;q=0.9",
                        "cache-control": "no-cache",
                        "pragma": "no-cache",
                        "referer": `https://geo.captcha-delivery.com/`,
                        "sec-ch-ua": '"Chromium";v="86", "\"Not\\A;Brand";v="99", "Google Chrome";v="86"',
                        "sec-ch-ua-mobile": "?0",
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin",
                        "user-agent": `${this.variables.static.userAgent}`
                    },
                    cookieJar: this.variables.static.cookieJar,
                    proxy: this.runArgs.proxy.current.parsed,
                    log: true,
                    id: this.id
                }, (err, res) => {
                    if (cancelled || !this.state.started || this.state.stopped) return;
                    try {
                        if (err) {
                            this.sendStatusMessage({id: this.id, msg: `Error Submitting Datadome (Request)`, status: "warning"});
                            return reject();
                        }
                        else {
                            if (res.statusCode === 200) {
                                const resJSON = JSON.parse(res.body);
                                if (resJSON.cookie) {
                                    this.variables.static.cookieJar.addCookies([resJSON.cookie]);
                                    return resolve();
                                } else {
                                    this.sendStatusMessage({id: this.id, msg: `Error Submitting Datadome (No Cookie)`, status: "warning"});
                                    return reject();
                                }
                            } else {
                                this.sendStatusMessage({id: this.id, msg: `Error Submitting Datadome (Status ${res.statusCode})`, status: "warning"});
                                return reject();        
                            }
                        }
                    } catch (err) {
                        this.sendStatusMessage({id: this.id, msg: `Error Submitting Datadome (Catch Request)`, status: "warning"});
                        return reject();
                    }
                })
            } catch (err) {
                this.sendStatusMessage({id: this.id, msg: `Error Submitting Datadome (Catch Full)`, status: "warning"});
                return reject();
            }
        })
    }

    solveDatadome() {
        const task = this;
        return new Promise(async (resolve, reject) => {
            try {
                task.sendStatusMessage({id: this.id, msg: 'Waiting For Geetest Captcha', status: 'waiting'})
                try {
                    const cookie = await task.solveCaptcha({type: 'DATADOME_GEETEST_SLIDE', url: this.variables.dynamic.datadomeUrl})
                    task.variables.static.cookieJar.addCookies([cookie], 'https://www.footlocker.com')
                    return resolve()
                } catch (err) {
                    task.sendStatusMessage({id: this.id, msg: 'Error Waiting For Geetest Captcha', status: 'err'})
                    return reject()
                }
            } catch (err) {
                task.sendStatusMessage({id: this.id, msg: 'Error Solving Datadome (Catch Full)', status: 'err'})
                return reject()
            }
        })
    }
    
    initializeSession() {
        return new Promise(async (resolve, reject, onCancel) => {
            let cancelled = false;
            onCancel(() => { cancelled = true; });
            try {
                this.sendStatusMessage({id: this.id, msg: "Initializing Session", status: "status"});

                if (cancelled || !this.state.started || this.state.stopped) return;

                this.request({
                    url: `https://${this.variables.static.host.value}/api/${this.variables.static.apiVersion.value}/session?timestamp=${Date.now()}`,
                    method: "GET",
                    headers: {
                        "accept": "application/json",
                        "accept-encoding": "gzip, deflate, br",
                        "accept-language": "en-US,en;q=0.9",
                        "cache-control": "no-cache",
                        "pragma": "no-cache",
                        "referer": `https://${this.variables.static.host.value}/`,
                        "sec-fetch-site": "same-origin",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-dest": "empty",
                        "user-agent": `${this.variables.static.userAgent}`,
                        "x-fl-request-id": `${this.randomUUIDV1()}`,
                    },
                    cookieJar: this.variables.static.cookieJar,
                    proxy: this.runArgs.proxy.current.parsed,
                    log: true,
                    id: this.id
                }, async (err, res) => {
                    if (cancelled || !this.state.started || this.state.stopped) return;
                    try {
                        if (err) {
                            this.sendStatusMessage({id: this.id, msg: `Error Initializing Session (Request)`, status: "warning"});
                            return reject();        
                        }
                        else {
                            if (res.statusCode === 200) {
                                const resJSON = JSON.parse(res.body);
                                if (resJSON.success && resJSON.data && resJSON.data.csrfToken) {
                                    this.variables.dynamic.csrfToken = resJSON.data.csrfToken;
                                    return resolve();
                                } else {
                                    this.sendStatusMessage({id: this.id, msg: `Error Initializing Session (CSRF Token)`, status: "warning"});
                                    return reject();
                                }
                            } else if (res.statusCode === 403) {
                                if (res.headers["server"] && res.headers["server"] === "AkamaiGHost") {
                                    this.sendStatusMessage({id: this.id, msg: `Error Initializing Session (Akamai Ban)`, status: "error"});
                                    this.stopTask();
                                    return;
                                } else if (res.headers["server"] && res.headers["server"] === "DataDome") {
                                    this.variables.dynamic.datadomeUrl = JSON.parse(res.body).url;
                                    await this.solveDatadome();
                                    return reject();
                                } else {
                                    this.sendStatusMessage({id: this.id, msg: `Error Initializing Session (Blocked By PerimeterX)`, status: "error"});
                                    this.stopTask();
                                    return;
                                }
                            } else if (res.statusCode.toString().startsWith("5") && res.body.includes('HTTP-EQUIV="Refresh"')) {
                                await this.solveQueue();
                                return reject();
                            }  else {
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

    getProductPage() {
        return new Promise(async (resolve, reject, onCancel) => {
            let cancelled = false;
            onCancel(() => { cancelled = true });
            try {
                this.sendStatusMessage({id: this.id, msg: `Getting Product Page`, status: "status"})

                if (cancelled || !this.state.started || this.state.stopped) return;

                this.request({
                    url: `https://${this.variables.static.host.value}/en/product/~/${this.productArgs.pid}.html`,
                    method: "GET",
                    headers: {
                        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                        "accept-encoding": "gzip, deflate, br",
                        "accept-language": "en-US,en;q=0.9",
                        "cache-control": "no-cache",
                        "referer": `https://${this.variables.static.host.value}/en/product/~/${this.productArgs.pid}.html`,
                        "pragma": "no-cache",
                        "sec-ch-ua": '"Chromium";v="92", " Not A;Brand";v="99", "Google Chrome";v="92"',
                        "sec-ch-ua-mobile": "?0",
                        "sec-fetch-site": "same-origin",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-dest": "empty",
                        "upgrade-insecure-requests": "1",
                        "user-agent": `${this.variables.static.userAgent}`,
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
                            if (res.statusCode === 200) {
                                if (/(window\.footlocker\.STATE_FROM_SERVER)(.*?)(=)(.*?)(false)/i.test(res.body)) {
                                    this.sendStatusMessage({id: this.id, msg: 'Error Getting Product Page (Empty)', status: 'warning'})
                                    return reject()
                                } else return resolve()
                            } else if (res.statusCode === 404) {
                                this.sendStatusMessage({id: this.id, msg: `Product Not Found`, status: "error"});
                                return reject()
                            } else if (res.statusCode === 403) {
                                if (res.headers["server"] && res.headers["server"] === "AkamaiGHost") {
                                    this.sendStatusMessage({id: this.id, msg: `Error Getting Product Page (Akamai Ban)`, status: "error"});
                                    this.stopTask();
                                } else if (res.headers["server"] && res.headers["server"] === "DataDome") {
                                    this.variables.dynamic.datadomeUrl = JSON.parse(res.body).url;
                                    await this.solveDatadome();
                                    return reject();
                                } else {
                                    this.sendStatusMessage({id: this.id, msg: `Error Getting Product Page (Blocked By PerimeterX)`, status: "error"});
                                    this.stopTask();
                                    return;
                                }
                            } else if (res.statusCode === 302 && res.headers["location"].includes("queue")) {
                                this.variables.dynamic.queue = {
                                    url: res.headers["location"],
                                    host: new URL(res.headers["location"]).host,
                                    cookieJar: new CookieJar(),
                                    customerId: new URL(res.headers["location"]).searchParams.get("c"),
                                    eventId: new URL(res.headers["location"]).searchParams.get("e"),
                                    sessions: []
                                }
                                await this.solveQueueIt();
                                return reject();
                            } else if (res.statusCode.toString().startsWith("5") && res.body.includes('HTTP-EQUIV="Refresh"')) {
                                await this.solveQueue();
                                return reject();
                            } else {
                                this.sendStatusMessage({id: this.id, msg: `Error Getting Product Page (Status ${res.statusCode})`, status: "warning"})
                                return reject();        
                            }
                        }
                    } catch (err) {
                        this.sendStatusMessage({id: this.id, msg: `Error Getting Product Page (Catch Request)`, status: "warning"})
                        return reject();
                    }
                })
            } catch (err) {
                this.sendStatusMessage({id: this.id, msg: `Error Getting Product Page (Catch Full)`, status: "warning"})
                return reject();
            }
        })
    }

    getProductInfo() {
        return new Promise(async (resolve, reject, onCancel) => {
            let cancelled = false;
            onCancel(() => { cancelled = true });
            try {
                this.sendStatusMessage({id: this.id, msg: `Getting Product Info`, status: "status"})

                if (cancelled || !this.state.started || this.state.stopped) return;

                this.request({
                    url: this.variables.static.apiVersion.value === 'v4' ? `https://${this.variables.static.host.value}/api/products/pdp/${this.productArgs.pid}?timestamp=${Date.now()}` : `https://${this.variables.static.host.value}/zgw/product-core/v1/pdp/${this.variables.static.siteCode.value}/sku/${this.productArgs.pid}`,
                    method: "GET",
                    headers: {
                        "accept": "*/*",
                        "accept-encoding": "gzip, deflate, br",
                        "accept-language": "en-US,en;q=0.9",
                        "cache-control": "no-cache",
                        "pragma": "no-cache",
                        "referer": `https://${this.variables.static.host.value}/en/product/~/${this.productArgs.pid}.html`,
                        "sec-ch-ua": '"Chromium";v="92", " Not A;Brand";v="99", "Google Chrome";v="92"',
                        "sec-ch-ua-mobile": "?0",
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin",
                        "user-agent": `${this.variables.static.userAgent}`,
                        ...(this.variables.static.apiVersion.value === '4' && {"x-fl-request-id": `${this.randomUUIDV1()}`}),
                        ...(this.variables.static.apiVersion.value === '4' && {'x-flapi-session-id': this.variables.static.cookieJar.getCookieValue('JSESSIONID')})
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
                            if (res.statusCode === 200) {
                                const resJSON = JSON.parse(res.body)
                                if (this.variables.static.apiVersion.value === 'v4') {
                                    this.variables.dynamic.matchedSizes = resJSON.sellableUnits.filter(x => this.productArgs.size.find(_size => (isNaN(_size.value) ? _size.value : parseFloat(_size.value) < 10 ? "0" + parseFloat(_size.value).toFixed(1) : parseFloat(_size.value).toFixed(1)) === x.attributes.find(attribute => attribute.type === 'size')?.value))
                                    if (this.variables.dynamic.matchedSizes.length) {
    
                                        const productInfo = resJSON.variantAttributes.find(attribute => attribute.sku === this.productArgs.pid)
                                        if (productInfo.skuLaunchDate && productInfo.displayCountDownTimer) {
                                            const launchDate = new Date(productInfo.skuLaunchDate)
    
                                            await new Promise(resolve => {
                                                if (launchDate.getTime() < Date.now()) return resolve()
                                                this.sendStatusMessage({id: this.id, msg: `Starting at ${launchDate.getFullYear()}/${(launchDate.getMonth() + 1 < 10 ? "0" : "") + parseInt(launchDate.getMonth() + 1)}/${((launchDate.getDate() < 10 ? "0" : "") + launchDate.getDate())} ${((launchDate.getHours() < 10 ? "0" : "") + launchDate.getHours())}:${((launchDate.getMinutes() < 10 ? "0" : "") + launchDate.getMinutes())}:${((launchDate.getSeconds() < 10 ? "0" : "") + launchDate.getSeconds())}`, status: "waiting"});
                                                const millisecondsUntilResolve = launchDate.getTime() - Date.now()
                                                setTimeout(resolve, millisecondsUntilResolve)
                                            })
    
                                            this.variables.dynamic.launchProduct = true;
                                        } else this.variables.dynamic.launchProduct = false;
                                        
                                        try {
                                            this.webhookArgs.name = resJSON.name
                                            this.webhookArgs.product = this.productArgs.pid
                                            const images = resJSON.images.find(image => image.variations.some(variation => variation.url.includes(this.productArgs.pid))).variations
                                            this.webhookArgs.image = images[images.length - 1].url // Get the largest image
    
                                            this.sendStatusMessage({id: this.id, taskUpdates: { product: resJSON.name}})
                                        } catch (err) {}
        
                                        return resolve()    
                                    } else {
                                        this.sendStatusMessage({id: this.id, msg: 'Size Not Found', status: 'warning'})
                                        return reject()
                                    }
                                } else {
                                    this.variables.dynamic.matchedSizes = resJSON.sizes.filter(x => this.productArgs.size.find(_size => (isNaN(_size.value) ? _size.value : parseFloat(_size.value) < 10 ? "0" + parseFloat(_size.value).toFixed(1) : parseFloat(_size.value).toFixed(1)) === x.size))
                                    if (this.variables.dynamic.matchedSizes.length) {
                                        if (resJSON?.style?.launchAttributes?.launchProduct && resJSON.style.launchAttributes.launchDate && resJSON.style.launchAttributes.launchDisplayCounterEnabled) {
                                            const launchDate = new Date(resJSON.style.launchAttributes.launchDate)
        
                                            await new Promise(resolve => {
                                                if (launchDate.getTime() < Date.now()) return resolve()
                                                this.sendStatusMessage({id: this.id, msg: `Starting at ${launchDate.getFullYear()}/${(launchDate.getMonth() + 1 < 10 ? "0" : "") + parseInt(launchDate.getMonth() + 1)}/${((launchDate.getDate() < 10 ? "0" : "") + launchDate.getDate())} ${((launchDate.getHours() < 10 ? "0" : "") + launchDate.getHours())}:${((launchDate.getMinutes() < 10 ? "0" : "") + launchDate.getMinutes())}:${((launchDate.getSeconds() < 10 ? "0" : "") + launchDate.getSeconds())}`, status: "waiting"});
                                                const millisecondsUntilResolve = launchDate.getTime() - Date.now()
                                                setTimeout(resolve, millisecondsUntilResolve)
                                            })
    
                                            this.variables.dynamic.launchProduct = true
                                        } else this.variables.dynamic.launchProduct = false
    
                                        try {
                                            this.webhookArgs.name = resJSON.model.name
                                            this.webhookArgs.product = this.productArgs.pid
                                            let psl = this.variables.static.host.value.split('.')
                                                psl.shift() // remove the www.
                                                psl = psl.join('.')

                                            // Kidsfootlocker uses the footlocker.com psl rather than it's own, unlike other footsites
                                            this.webhookArgs.image = `https://images.${psl === 'kidsfootlocker.com' ? 'footlocker.com' : psl}/is/image/EBFL2/${this.productArgs.pid}`
    
                                            this.sendStatusMessage({id: this.id, taskUpdates: {product: resJSON.model.name}})
                                        } catch (err) {}
    
                                        return resolve()    
                                    } else {
                                        this.sendStatusMessage({id: this.id, msg: 'Size Not Found', status: 'warning'})
                                        return reject()
                                    }
                                }
                            } else if (res.statusCode === 400 || res.statusCode === 404) {
                                this.sendStatusMessage({id: this.id, msg: `Product Not Found`, status: "error"});
                                return reject()
                            } else if (res.statusCode === 403) {
                                if (res.headers["server"] && res.headers["server"] === "AkamaiGHost") {
                                    this.sendStatusMessage({id: this.id, msg: `Error Getting Product Info (Akamai Ban)`, status: "error"});
                                    this.stopTask();
                                } else if (res.headers["server"] && res.headers["server"] === "DataDome") {
                                    this.variables.dynamic.datadomeUrl = JSON.parse(res.body).url;
                                    await this.solveDatadome();
                                    return reject();
                                } else {
                                    this.sendStatusMessage({id: this.id, msg: `Error Getting Product Info (Blocked By PerimeterX)`, status: "error"});
                                    this.stopTask();
                                    return;
                                }
                            } else if (res.statusCode === 302 && res.headers["location"].includes("queue")) {
                                this.variables.dynamic.queue = {
                                    url: res.headers["location"],
                                    host: new URL(res.headers["location"]).host,
                                    cookieJar: new CookieJar(),
                                    customerId: new URL(res.headers["location"]).searchParams.get("c"),
                                    eventId: new URL(res.headers["location"]).searchParams.get("e"),
                                    sessions: []
                                }
                                await this.solveQueueIt();
                                return reject();
                            } else if (res.statusCode.toString().startsWith("5") && res.body.includes('HTTP-EQUIV="Refresh"')) {
                                await this.solveQueue();
                                return reject();
                            } else {
                                this.sendStatusMessage({id: this.id, msg: `Error Getting Product Info (Status ${res.statusCode})`, status: "warning"})
                                return reject();        
                            }
                        }
                    } catch (err) {
                        this.sendStatusMessage({id: this.id, msg: `Error Getting Product Info (Catch Request)`, status: "warning"})
                        return reject();
                    }
                })
            } catch (err) {
                this.sendStatusMessage({id: this.id, msg: `Error Getting Product Info (Catch Full)`, status: "warning"})
                return reject();
            }
        })
    }

    addToCart() {
        return new Promise(async (resolve, reject, onCancel) => {
            let cancelled = false;
            onCancel(() => { cancelled = true });
            try {
                // Generate akamai on first ATC attempt, if not a launch product (Queue messes with generating cookies)
                !this.variables.static.datadome.value && !this.variables.dynamic.launchProduct && this.variables.static.akamai.retries === 0 && await this.variables.static.akamai.generate();

                // Choose random size out of task's chosen sizes and the sizes available
                const productSize = this.variables.dynamic.matchedSizes[this.randomInt(0, this.variables.dynamic.matchedSizes.length - 1)];
                const size = this.variables.static.apiVersion.value === 'v4' ? productSize.attributes.find(attribute => attribute.type === 'size') : productSize

                const sizeLabel = this.productArgs.size.find(_size => (isNaN(_size.value) ? _size.value : parseFloat(_size.value) < 10 ? "0" + parseFloat(_size.value).toFixed(1) : parseFloat(_size.value).toFixed(1)) === (this.variables.static.apiVersion.value === 'v4' ? size.value : size.size)).label
                const data = {
                    "productQuantity": 1,
                    "productId": this.variables.static.apiVersion.value === 'v4' ? size.id.toString() : size.productWebKey.toString()
                };                

                this.sendStatusMessage({id: this.id, msg: `Adding To Cart`, status: "status", taskUpdates: {size: sizeLabel}});

                if (cancelled || !this.state.started || this.state.stopped) return;

                this.request({
                    url: `https://${this.variables.static.host.value}/api/users/carts/current/entries?timestamp=${Date.now()}`,
                    method: "POST",
                    headers: {
                        "accept": "application/json",
                        "accept-encoding": this.randomUUIDV1(),
                        "accept-language": this.randomUUIDV1(),
                        "cache-control": "min-fresh=0",
                        "content-type": "application/json",
                        "origin": `https://${this.variables.static.host.value}`,
                        "pragma": "no-cache",
                        "referer": `https://${this.variables.static.host.value}/`,
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin",
                        "user-agent": `${this.variables.static.userAgent}`,
                        "x-csrf-token": `${this.variables.dynamic.csrfToken}`,
                        "x-fl-productid": this.variables.static.apiVersion.value === 'v4' ? size.id.toString() : size.productWebKey.toString(),
                        "x-fl-request-id": `${this.randomUUIDV1()}`
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
                        }
                        else {
                            if (res.statusCode === 200) {
                                const resJSON = JSON.parse(res.body);
                                this.variables.dynamic.cartID = resJSON.guid;

                                try {
                                    this.webhookArgs.price = this.variables.static.apiVersion.value === 'v4' ? productSize.price.value : productSize.price.salePrice;
                                    this.webhookArgs.size = sizeLabel   
                                    this.webhookArgs.generated = true
                                } catch (err) {}

                                return resolve();
                            } else if (res.statusCode === 531) {
                                const resJSON = JSON.parse(res.body);
                                if (resJSON.errors.find(message => message.type === "ProductLowStockException")) {
                                    this.sendStatusMessage({id: this.id, msg: `Out Of Stock (Size ${sizeLabel})`, status: "warning"});
                                    return reject();    
                                } else {
                                    this.sendStatusMessage({id: this.id, msg: `Error Adding To Cart (${resJSON.errors[0].type})`, status: "warning"});
                                    return reject();    
                                }
                            } else if (res.statusCode === 403) {
                                if (res.headers["server"] && res.headers["server"] === "AkamaiGHost") {
                                    await this.variables.static.akamai.generate();
                                    return reject();
                                } else if (res.headers["server"] && res.headers["server"] === "DataDome") {
                                    this.variables.dynamic.datadomeUrl = JSON.parse(res.body).url;
                                    await this.solveDatadome();
                                    return reject();
                                } else {
                                    this.sendStatusMessage({id: this.id, msg: `Error Adding To Cart (Blocked By PerimeterX)`, status: "error"});
                                    this.stopTask();
                                    return;
                                }
                            } else if (res.statusCode.toString().startsWith("5") && res.body.includes('HTTP-EQUIV="Refresh"')) {
                                await this.solveQueue();
                                return reject();
                            } else if (res.statusCode === 429) {
                                this.sendStatusMessage({id: this.id, msg: `Error Adding To Cart (Proxy Blocked)`, status: "warning"});
                                return reject();
                            } else {
                                this.sendStatusMessage({id: this.id, msg: `Error Adding To Cart (Status ${res.statusCode})`, status: "warning"});
                                return reject();
                            }
                        }
                    } catch (err) {
                        this.sendStatusMessage({id: this.id, msg: `Error Adding To Cart (Catch Request)`, status: "warning"})
                        return reject();
                    }
                })
            } catch (err) {
                this.sendStatusMessage({id: this.id, msg: `Error Adding To Cart (Catch Full)`, status: "warning"})
                return reject();
            }
        })
    }

    submitEmail() {
        return new Promise(async (resolve, reject, onCancel) => {
            let cancelled = false;
            onCancel(() => { cancelled = true });
            try {

                this.sendStatusMessage({id: this.id, msg: `Submitting Email`, status: "status"});

                if (cancelled || !this.state.started || this.state.stopped) return;

                this.request({
                    url: `https://${this.variables.static.host.value}/api/users/carts/current/email/${this.profile.email_address}?timestamp=${Date.now()}`,
                    method: "PUT",
                    headers: {
                        "accept": "application/json",
                        "accept-encoding": "gzip, deflate, br",
                        "accept-language": "en-US,en;q=0.9",
                        "cache-control": "no-cache",
                        "content-type": "application/json",
                        "origin": `https://${this.variables.static.host.value}`,
                        "pragma": "no-cache",
                        "referer": `https://${this.variables.static.host.value}/checkout`,
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin",
                        "user-agent": `${this.variables.static.userAgent}`,
                        "x-csrf-token": `${this.variables.dynamic.csrfToken}`,
                        "x-fl-request-id": `${this.randomUUIDV1()}`
                    },
                    cookieJar: this.variables.static.cookieJar,
                    proxy: this.runArgs.proxy.current.parsed
                }, async (err, res) => {
                    if (cancelled || !this.state.started || this.state.stopped) return;
                    try {
                        if (err) {
                            this.sendStatusMessage({id: this.id, msg: `Error Submitting Email (Request)`, status: "warning"});
                            return reject();
                        } else {
                            if (res.statusCode === 200) {
                                return resolve();
                            } else if (res.statusCode === 403) {
                                if (res.headers["server"] && res.headers["server"] === "AkamaiGHost") {
                                    await this.variables.static.akamai.generate();
                                    return reject();
                                } else if (res.headers["server"] && res.headers["server"] === "DataDome") {
                                    this.variables.dynamic.datadomeUrl = JSON.parse(res.body).url;
                                    await this.solveDatadome();
                                    return reject();
                                } else {
                                    this.sendStatusMessage({id: this.id, msg: `Error Submitting Email (Blocked By PerimeterX)`, status: "error"});
                                    this.stopTask();
                                    return;
                                }
                            } else if (res.statusCode.toString().startsWith("5") && res.body.includes('HTTP-EQUIV="Refresh"')) {
                                await this.solveQueue();
                                return reject();
                            } else {
                                this.sendStatusMessage({id: this.id, msg: `Error Submitting Email (Status ${res.statusCode})`, status: "warning"});
                                return reject();
                            }
                        }
                    } catch (err) {
                        this.sendStatusMessage({id: this.id, msg: `Error Submitting Email (Catch Request)`, status: "warning"})
                        return reject();
                    }
                })
            } catch (err) {
                this.sendStatusMessage({id: this.id, msg: `Error Submitting Email (Catch Full)`, status: "warning"})
                return reject();
            }
        })
    }

    submitShippingAddress() {
        return new Promise(async (resolve, reject, onCancel) => {
            let cancelled = false;
            onCancel(() => { cancelled = true });
            try {

                this.sendStatusMessage({id: this.id, msg: `Submitting Shipping Address`, status: "status"});

                const data = {
                    "shippingAddress": {
                        "setAsBilling": this.profile.same_shipping,
                        "country": {
                            "isocode": this.profile.shipping_country.value,
                            "name": this.profile.shipping_country.label
                        },
                        "id": null,
                        "region":{
                            "countryIso": this.profile.shipping_country.value,
                            "isocode": `${this.profile.shipping_country.value}-${this.profile.shipping_state.value}`,
                            "isocodeShort": this.profile.shipping_state.value,
                            "name": this.profile.shipping_state.label,
                        },
                        "phone": this.profile.phone_number,
                        "type": "default",
                        "firstName": this.profile.shipping_first_name,
                        "lastName": this.profile.shipping_last_name,
                        "line1": this.profile.shipping_address_line_1,
                        ...(this.profile.shipping_address_line_2 && {"line2": this.profile.shipping_address_line_2}),
                        "postalCode": this.profile.shipping_zip_code,
                        "town": this.profile.shipping_city,
                        "regionFPO": null,
                        "email": false,
                        "shippingAddress": true,
                        "recordType": "S"    
                    }
                };

                if (cancelled || !this.state.started || this.state.stopped) return;

                this.request({
                    url: `https://${this.variables.static.host.value}/api/users/carts/current/addresses/shipping?timestamp=${Date.now()}`,
                    method: "POST",
                    headers: {
                        "accept": "application/json",
                        "accept-encoding": "gzip, deflate, br",
                        "accept-language": "en-US,en;q=0.9",
                        "cache-control": "no-cache",
                        "content-type": "application/json",
                        "origin": `https://${this.variables.static.host.value}`,
                        "pragma": "no-cache",
                        "referer": `https://${this.variables.static.host.value}/checkout`,
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin",
                        "user-agent": `${this.variables.static.userAgent}`,
                        "x-csrf-token": `${this.variables.dynamic.csrfToken}`,
                        "x-fl-request-id": `${this.randomUUIDV1()}`
                    },
                    cookieJar: this.variables.static.cookieJar,
                    proxy: this.runArgs.proxy.current.parsed,
                    body: JSON.stringify(data)
                }, async (err, res) => {
                    if (cancelled || !this.state.started || this.state.stopped) return;
                    try {
                        if (err) {
                            this.sendStatusMessage({id: this.id, msg: `Error Submitting Shipping Address (Request)`, status: "warning"});
                            return reject();
                        } else {
                            if (res.statusCode === 201) {
                                return resolve();
                            } else if (res.statusCode === 403) {
                                if (res.headers["server"] && res.headers["server"] === "AkamaiGHost") {
                                    await this.variables.static.akamai.generate();
                                    return reject();
                                } else if (res.headers["server"] && res.headers["server"] === "DataDome") {
                                    this.variables.dynamic.datadomeUrl = JSON.parse(res.body).url;
                                    await this.solveDatadome();
                                    return reject();
                                } else {
                                    this.sendStatusMessage({id: this.id, msg: `Error Submitting Shipping Address (Blocked By PerimeterX)`, status: "error"});
                                    this.stopTask();
                                    return;
                                }
                            } else if (res.statusCode.toString().startsWith("5") && res.body.includes('HTTP-EQUIV="Refresh"')) {
                                await this.solveQueue();
                                return reject();
                            } else {
                                this.sendStatusMessage({id: this.id, msg: `Error Submitting Shipping Address (Status ${res.statusCode})`, status: "warning"});
                                return reject();
                            }
                        }
                    } catch (err) {
                        this.sendStatusMessage({id: this.id, msg: `Error Submitting Shipping Address (Catch Request)`, status: "warning"})
                        return reject();
                    }
                })
            } catch (err) {
                this.sendStatusMessage({id: this.id, msg: `Error Submitting Shipping Address (Catch Full)`, status: "warning"})
                return reject();
            }
        })
    }

    submitBillingAddress() {
        return new Promise(async (resolve, reject, onCancel) => {
            let cancelled = false;
            onCancel(() => { cancelled = true });
            try {

                this.sendStatusMessage({id: this.id, msg: `Submitting Billing Address`, status: "status"});


                const data = {
                    "setAsBilling": false,
                    "country": {
                        "isocode": this.profile.billing_country.value,
                        "name": this.profile.billing_country.label
                    },
                    "id": null,
                    "region": {
                        "countryIso": this.profile.billing_country.value,
                        "isocode": `${this.profile.billing_country.value}-${this.profile.billing_state.value}`,
                        "isocodeShort": this.profile.billing_state.value,
                        "name": this.profile.billing_state.label
                    },
                    "phone": this.profile.phone_number,
                    "type": "default",
                    "firstName": this.profile.billing_first_name,
                    "lastName": this.profile.billing_last_name,
                    "line1": this.profile.billing_address_line_1,
                    ...(this.profile.billing_address_line_2 && {"line2": this.profile.billing_address_line_2}),
                    "postalCode": this.profile.billing_zip_code,
                    "town": this.profile.billing_city,
                    "regionFPO": null,
                    "recordType": "S",
                    "shippingAddress": true
                };

                if (cancelled || !this.state.started || this.state.stopped) return;

                this.request({
                    url: `https://${this.variables.static.host.value}/api/users/carts/current/set-billing?timestamp=${Date.now()}`,
                    method: "POST",
                    headers: {
                        "accept": "application/json",
                        "accept-encoding": "gzip, deflate, br",
                        "accept-language": "en-US,en;q=0.9",
                        "cache-control": "no-cache",
                        "content-type": "application/json",
                        "origin": `https://${this.variables.static.host.value}`,
                        "pragma": "no-cache",
                        "referer": `https://${this.variables.static.host.value}/checkout`,
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin",
                        "user-agent": `${this.variables.static.userAgent}`,
                        "x-csrf-token": `${this.variables.dynamic.csrfToken}`,
                        "x-fl-request-id": `${this.randomUUIDV1()}`
                    },
                    cookieJar: this.variables.static.cookieJar,
                    proxy: this.runArgs.proxy.current.parsed,
                    body: JSON.stringify(data)
                }, async (err, res) => {
                    if (cancelled || !this.state.started || this.state.stopped) return;
                    try {
                        if (err) {
                            this.sendStatusMessage({id: this.id, msg: `Error Submitting Billing Address (Request)`, status: "warning"});
                            return reject();
                        }
                        else {
                            if (res.statusCode === 200) {
                                return resolve();
                            } else if (res.statusCode === 403) {
                                if (res.headers["server"] && res.headers["server"] === "AkamaiGHost") {
                                    await this.variables.static.akamai.generate();
                                    return reject();
                                } else if (res.headers["server"] && res.headers["server"] === "DataDome") {
                                    this.variables.dynamic.datadomeUrl = JSON.parse(res.body).url;
                                    await this.solveDatadome();
                                    return reject();
                                } else {
                                    this.sendStatusMessage({id: this.id, msg: `Error Submitting Billing Address (Blocked By PerimeterX)`, status: "error"});
                                    this.stopTask();
                                    return;
                                }
                            } else if (res.statusCode.toString().startsWith("5") && res.body.includes('HTTP-EQUIV="Refresh"')) {
                                await this.solveQueue();
                                return reject();
                            } else {
                                this.sendStatusMessage({id: this.id, msg: `Error Submitting Billing Address (Status ${res.statusCode})`, status: "warning"});
                                return reject();
                            }
                        }
                    } catch (err) {
                        this.sendStatusMessage({id: this.id, msg: `Error Submitting Billing Address (Catch Request)`, status: "warning"})
                        return reject();
                    }
                })
            } catch (err) {
                this.sendStatusMessage({id: this.id, msg: `Error Submitting Billing Address (Catch Full)`, status: "warning"})
                return reject();
            }
        })
    }

    initializePaypal() {
        return new Promise(async (resolve, reject, onCancel) => {
            let cancelled = false;
            onCancel(() => { cancelled = true });
            try {

                this.sendStatusMessage({id: this.id, msg: `Initializing Paypal`, status: "status"});

                this.variables.dynamic.paypalSessionID = this.randomUUIDV1();

                const data = {
                    "returnUrl": "x",
                    "cancelUrl": "x",
                    "offerPaypalCredit": false,
                    "experienceProfile":{
                        "brandName": "FootLocker",
                        "noShipping": "false",
                        "addressOverride": false
                    },
                    "amount": this.webhookArgs.price,
                    "currencyIsoCode": "USD",
                    "intent": "authorize",
                    "braintreeLibraryVersion": "braintree/web/3.29.0",
                    "_meta": {
                        "merchantAppId": this.variables.static.host.value,
                        "platform": "web",
                        "sdkVersion": "3.29.0",
                        "source": "client",
                        "integration": "custom",
                        "integrationType": "custom",
                        "sessionId": this.variables.dynamic.paypalSessionID
                    },
                    "tokenizationKey": this.variables.static.tokenizationKey.value
                };

                if (cancelled || !this.state.started || this.state.stopped) return;

                this.request({
                    url: `https://api.braintreegateway.com/merchants/rfbkw27jcwmw2xgp/client_api/v1/paypal_hermes/create_payment_resource`,
                    method: "POST",
                    headers: {
                        "accept": "application/json",
                        "accept-encoding": "gzip, deflate, br",
                        "accept-language": "en-US,en;q=0.9",
                        "content-type": "application/json",
                        "origin": `https://${this.variables.static.host.value}`,
                        "referer": `https://${this.variables.static.host.value}/cart`,
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "cross-site",
                        "user-agent": `${this.variables.static.userAgent}`,
                    },
                    cookieJar: this.variables.static.cookieJar,
                    proxy: this.runArgs.proxy.current.parsed,
                    body: JSON.stringify(data)
                }, async (err, res) => {
                    if (cancelled || !this.state.started || this.state.stopped) return;
                    try {
                        if (err) {
                            this.sendStatusMessage({id: this.id, msg: `Error Initializing Paypal (Request)`, status: "warning"});
                            return reject();
                        } else {
                            if (res.statusCode === 201) {
                                const resJSON = JSON.parse(res.body);
                                this.variables.dynamic.paypalPaymentToken = resJSON.paymentResource.paymentToken;
                                this.variables.dynamic.paypalECToken = new URLSearchParams(resJSON.paymentResource.redirectUrl).get("token");
                                return resolve();
                            } else {
                                this.sendStatusMessage({id: this.id, msg: `Error Initializing Paypal (Status ${res.statusCode})`, status: "warning"});
                                return reject();
                            }
                        }
                    } catch (err) {
                        this.sendStatusMessage({id: this.id, msg: `Error Initializing Paypal (Catch Request)`, status: "warning"})
                        return reject();
                    }
                })
            } catch (err) {
                this.sendStatusMessage({id: this.id, msg: `Error Initializing Paypal (Catch Full)`, status: "warning"})
                return reject();
            }
        })
    }

    submitPaypalDetails() {
        return new Promise(async (resolve, reject, onCancel) => {
            let cancelled = false;
            onCancel(() => { cancelled = true });
            try {

                this.sendStatusMessage({id: this.id, msg: `Submitting Paypal Details`, status: "status"});

                const data = {
                    "operationName": "OnboardGuestMutation",
                    "variables": {
                        "card": {
                            "cardNumber": this.profile.card_number,
                            "expirationDate": `${this.profile.card_expiry_month}/${parseInt(this.profile.card_expiry_year) + 2000}`,
                            "securityCode": this.profile.card_security_code,
                            "type": this.profile.card_type
                        },
                        "currencyConversionType": "PAYPAL",
                        "country": this.profile.billing_country.value,
                        "email": this.profile.email_address,
                        "firstName": this.profile.billing_first_name,
                        "lastName": this.profile.billing_last_name,
                        "phone": {
                            "countryCode": "1",
                            "number": this.profile.phone_number,
                            "type": "MOBILE"
                        },
                        "supportedThreeDsExperiences": ["IFRAME"],
                        "token": this.variables.dynamic.paypalECToken,
                        "billingAddress": {
                            "line1": this.variables.billing_address_line_1,
                            ...(this.profile.billing_address_line_2 && {"line2": this.profile.billing_address_line_2}),
                            "city": this.profile.billing_city,
                            "state": this.profile.billing_state.value,
                            "postalCode": this.profile.billing_zip_code,
                            "accountQuality": {
                                "autoCompleteType": "MERCHANT_PREFILLED",
                                "isUserModified": true,
                                "twoFactorPhoneVerificationId": ""
                            },
                            "country": this.profile.billing_country.value,
                            "familyName": this.profile.billing_first_name,
                            "givenName": this.profile.billing_last_name
                        },
                        "shippingAddress": {
                            "line1": this.profile.shipping_zip_code,
                            ...(this.profile.shipping_address_line_2 && {"line2": this.profile.shipping_address_line_2}),
                            "city": this.profile.shipping_city,
                            "state": this.profile.shipping_state.value,
                            "postalCode": this.profile.shipping_zip_code,
                            "accountQuality": {
                                "autoCompleteType": "MANUAL",
                                "isUserModified": true
                            },
                            "country": this.profile.shipping_country.value,
                            "familyName": this.profile.shipping_first_name,
                            "givenName": this.profile.shipping_last_name
                        }
                    },
                    "query": "mutation OnboardGuestMutation($bank: BankAccountInput, $billingAddress: AddressInput, $card: CardInput, $country: CountryCodes, $currencyConversionType: CheckoutCurrencyConversionType, $dateOfBirth: DateOfBirth, $email: String, $firstName: String!, $lastName: String!, $phone: PhoneInput, $shareAddressWithDonatee: Boolean, $shippingAddress: AddressInput, $supportedThreeDsExperiences: [ThreeDSPaymentExperience], $token: String!) {\n  onboardAccount: onboardGuest(bank: $bank, billingAddress: $billingAddress, card: $card, country: $country, currencyConversionType: $currencyConversionType, dateOfBirth: $dateOfBirth, email: $email, firstName: $firstName, lastName: $lastName, phone: $phone, shareAddressWithDonatee: $shareAddressWithDonatee, shippingAddress: $shippingAddress, token: $token) {\n    buyer {\n      auth {\n        accessToken\n        __typename\n      }\n      userId\n      __typename\n    }\n    flags {\n      is3DSecureRequired\n      __typename\n    }\n    paymentContingencies {\n      threeDomainSecure(experiences: $supportedThreeDsExperiences) {\n        status\n        redirectUrl {\n          href\n          __typename\n        }\n        method\n        parameter\n        experience\n        requestParams {\n          key\n          value\n          __typename\n        }\n        __typename\n      }\n      threeDSContingencyData {\n        name\n        causeName\n        resolution {\n          type\n          resolutionName\n          paymentCard {\n            id\n            type\n            number\n            bankIdentificationNumber\n            __typename\n          }\n          contingencyContext {\n            deviceDataCollectionUrl {\n              href\n              __typename\n            }\n            jwtSpecification {\n              jwtDuration\n              jwtIssuer\n              jwtOrgUnitId\n              type\n              __typename\n            }\n            reason\n            referenceId\n            source\n            __typename\n          }\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n"
                };

                if (cancelled || !this.state.started || this.state.stopped) return;

                this.request({
                    url: `https://www.paypal.com/graphql?OnboardGuestMutation`,
                    method: "POST",
                    headers: {
                        "accept": "*/*",
                        "accept-encoding": "gzip, deflate, br",
                        "accept-language": "en-US,en;q=0.9",
                        "content-type": "application/json",
                        "origin": `https://www.paypal.com`,
                        "paypal-client-context": `${this.variables.dynamic.paypalECToken}`,
                        "paypal-client-metadata-id": `${this.variables.dynamic.paypalECToken}`,
                        "referer": `https://www.paypal.com/checkoutweb/signup?token=${this.variables.dynamic.paypalECToken}`,
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin",
                        "user-agent": `${this.variables.static.userAgent}`,
                        "x-app-name": "checkoutuinodeweb_onboarding_lite",
                        "x-country": `${this.profile.billing_country.value}`,
                        "x-locale": `en_${this.profile.billing_country.value}`
                    },
                    cookieJar: this.variables.static.cookieJar,
                    proxy: this.runArgs.proxy.current.parsed,
                    body: JSON.stringify(data)
                }, async (err, res) => {
                    if (cancelled || !this.state.started || this.state.stopped) return;
                    try {
                        if (err) {
                            this.sendStatusMessage({id: this.id, msg: `Error Submitting Paypal Details (Request)`, status: "warning"});
                            return reject();
                        }
                        else {
                            if (res.statusCode === 200) {
                                const resJSON = JSON.parse(res.body);
                                if (!resJSON.errors && resJSON.data && resJSON.data.onboardAccount) {
                                    this.variables.dynamic.paypalPayerID = resJSON.data.onboardAccount.buyer.userId;
                                    this.variables.dynamic.paypalAuthAccessToken = resJSON.data.onboardAccount.buyer.auth.accessToken;
                                    return resolve();
                                } else if (resJSON.errors) {
                                    this.sendStatusMessage({id: this.id, msg: `Error Submitting Paypal Details ${this.variables.static.paypalErrorHandlers.filter(_errorHandler => resJSON.errors.some(_error => _error.message === _errorHandler.code)).map(_errorHandler => `(${_errorHandler.message})`).join(" ")}`, status: "error"});
                                    this.stopTask();
                                    return;            
                                } else {
                                    this.sendStatusMessage({id: this.id, msg: `Error Submitting Paypal Details (JSON Response)`, status: "error"});
                                    this.stopTask();
                                    return;     
                                }
                            } else {
                                this.sendStatusMessage({id: this.id, msg: `Error Submitting Paypal Details (Status ${res.statusCode})`, status: "error"});
                                this.stopTask();
                                return;
                            }
                        }
                    } catch (err) {
                        this.sendStatusMessage({id: this.id, msg: `Error Submitting Paypal Details (Catch Request)`, status: "error"});
                        this.stopTask();
                        return;
                    }
                })
            } catch (err) {
                this.sendStatusMessage({id: this.id, msg: `Error Submitting Paypal Details (Catch Full)`, status: "errpr"});
                this.stopTask();
                return;
            }
        })
    }

    approvePaypal() {
        return new Promise(async (resolve, reject, onCancel) => {
            let cancelled = false;
            onCancel(() => { cancelled = true });
            try {

                this.sendStatusMessage({id: this.id, msg: `Approving Paypal`, status: "status"});

                const data = {
                    "operationName": "ApproveOnboardPaymentMutation",
                    "variables": {
                        "token": this.variables.dynamic.paypalECToken
                    },
                    "query": "mutation ApproveOnboardPaymentMutation($token: String!) {\n  approveGuestSignUpPayment(token: $token) {\n    buyer {\n      userId\n      __typename\n    }\n    cart {\n      paymentId\n      returnUrl {\n        href\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n"
                };

                if (cancelled || !this.state.started || this.state.stopped) return;

                this.request({
                    url: `https://www.paypal.com/graphql?ApproveOnboardPaymentMutation`,
                    method: "POST",
                    headers: {
                        "accept": "*/*",
                        "accept-encoding": "gzip, deflate, br",
                        "accept-language": "en-US,en;q=0.9",
                        "content-type": "application/json",
                        "origin": `https://www.paypal.com`,
                        "paypal-client-context": `${this.variables.dynamic.paypalECToken}`,
                        "paypal-client-metadata-id": `${this.variables.dynamic.paypalECToken}`,
                        "referer": `https://www.paypal.com/checkoutweb/signup?token=${this.variables.dynamic.paypalECToken}`,
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin",
                        "user-agent": `${this.variables.static.userAgent}`,
                        "x-app-name": "checkoutuinodeweb_onboarding_lite",
                        "x-country": `${this.profile.billing_country.value}`,
                        "x-locale": `en_${this.profile.billing_country.value}`,
                        "x-paypal-internal-euat": `${this.variables.dynamic.paypalAuthAccessToken}`
                    },
                    cookieJar: this.variables.static.cookieJar,
                    proxy: this.runArgs.proxy.current.parsed,
                    body: JSON.stringify(data)
                }, async (err, res) => {
                    if (cancelled || !this.state.started || this.state.stopped) return;
                    try {
                        if (err) {
                            this.sendStatusMessage({id: this.id, msg: `Error Approving Paypal (Request)`, status: "warning"});
                            return reject();
                        } else {
                            if (res.statusCode === 200) {
                                const resJSON = JSON.parse(res.body);
                                if (!resJSON.errors && resJSON.data && resJSON.data.approveGuestSignUpPayment) {
                                    return resolve();
                                } else if (resJSON.errors) {
                                    this.sendStatusMessage({id: this.id, msg: `Error Approving Paypal ${this.variables.static.paypalErrorHandlers.filter(_errorHandler => resJSON.errors.some(_error => _error.message === _errorHandler.code)).map(_errorHandler => `(${_errorHandler.message})`).join(" ")}`, status: "error"});
                                    this.stopTask();
                                    return;            
                                } else {
                                    this.sendStatusMessage({id: this.id, msg: `Error Approving Paypal (JSON Response)`, status: "error"});
                                    this.stopTask();
                                    return;     
                                }
                            } else {
                                this.sendStatusMessage({id: this.id, msg: `Error Approving Paypal (Status ${res.statusCode})`, status: "error"});
                                this.stopTask();
                                return;
                            }
                        }
                    } catch (err) {
                        this.sendStatusMessage({id: this.id, msg: `Error Approving Paypal (Catch Request)`, status: "error"});
                        this.stopTask();
                        return;
                    }
                })
            } catch (err) {
                this.sendStatusMessage({id: this.id, msg: `Error Approving Paypal (Catch Full)`, status: "errpr"});
                this.stopTask();
                return;
            }
        })
    }

    submitPaypalAccount() {
        return new Promise(async (resolve, reject, onCancel) => {
            let cancelled = false;
            onCancel(() => { cancelled = true });
            try {

                this.sendStatusMessage({id: this.id, msg: `Submitting Paypal Account`, status: "status"});

                const data = {
                    "paypalAccount": {
                        "correlationId": this.variables.dynamic.paypalECToken,
                        "options": {
                            "validate": false
                        },
                        "paymentToken": this.variables.dynamic.paypalPaymentToken,
                        "payerId": this.variables.dynamic.paypalPayerID,
                        "unilateral": false,
                        "intent": "authorize"
                    },
                    "braintreeLibraryVersion": "braintree/web/3.29.0",
                    "_meta": {
                        "merchantAppId": this.variables.static.host.value,
                        "platform": "web",
                        "sdkVersion": "3.29.0",
                        "source": "client",
                        "integration": "custom",
                        "integrationType": "custom",
                        "sessionId": this.variables.dynamic.paypalSessionID
                    },
                    "tokenizationKey": this.variables.static.tokenizationKey.value
                };

                if (cancelled || !this.state.started || this.state.stopped) return;

                this.request({
                    url: `https://api.braintreegateway.com/merchants/rfbkw27jcwmw2xgp/client_api/v1/payment_methods/paypal_accounts`,
                    method: "POST",
                    headers: {
                        "accept": "application/json",
                        "accept-encoding": "gzip, deflate, br",
                        "accept-language": "en-US,en;q=0.9",
                        "content-type": "application/json",
                        "origin": `https://${this.variables.static.host.value}`,
                        "referer": `https://${this.variables.static.host.value}/`,
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "cross-site",
                        "user-agent": `${this.variables.static.userAgent}`,
                    },
                    cookieJar: this.variables.static.cookieJar,
                    proxy: this.runArgs.proxy.current.parsed,
                    body: JSON.stringify(data)
                }, async (err, res) => {
                    if (cancelled || !this.state.started || this.state.stopped) return;
                    try {
                        if (err) {
                            this.sendStatusMessage({id: this.id, msg: `Error Submitting Paypal Account (Request)`, status: "warning"});
                            return reject();
                        }
                        else {
                            if (res.statusCode === 202) {
                                const resJSON = JSON.parse(res.body);
                                if (resJSON.paypalAccounts[0].nonce) {
                                    this.variables.dynamic.paypalNonce = resJSON.paypalAccounts[0].nonce;
                                    return resolve();
                                } else {
                                    this.sendStatusMessage({id: this.id, msg: `Error Submitting Paypal Account (Nonce)`, status: "warning"});
                                    return reject();    
                                }
                            } else {
                                this.sendStatusMessage({id: this.id, msg: `Error Submitting Paypal Account (Status ${res.statusCode})`, status: "warning"});
                                return reject();
                            }
                        }
                    } catch (err) {
                        this.sendStatusMessage({id: this.id, msg: `Error Submitting Paypal Account (Catch Request)`, status: "warning"})
                        return reject();
                    }
                })
            } catch (err) {
                this.sendStatusMessage({id: this.id, msg: `Error Submitting Paypal Account (Catch Full)`, status: "warning"})
                return reject();
            }
        })
    }

    submitPaypal() {
        return new Promise(async (resolve, reject, onCancel) => {
            let cancelled = false;
            onCancel(() => { cancelled = true });
            try {

                this.sendStatusMessage({id: this.id, msg: `Submitting Paypal`, status: "status"});

                const data = {
                    "checkoutType": "EXPRESS",
                    "nonce": this.variables.dynamic.paypalNonce,
                    "details": {
                        "email": this.profile.email_address,
                        "firstName": this.profile.billing_first_name,
                        "lastName": this.profile.billing_last_name,
                        "payerId": this.variables.dynamic.paypalPayerID,
                        "shippingAddress": {
                            "recipientName": `${this.profile.shipping_first_name} ${this.profile.shipping_last_name}`,
                            "line1": this.profile.shipping_address_line_1,
                            ...(this.profile.shipping_address_line_2 && {"line2":this.profile.shipping_address_line_2}),
                            "city": this.profile.shipping_city,
                            "state": this.profile.shipping_state.value,
                            "postalCode": this.profile.shipping_zip_code,
                            "countryCode": this.profile.shipping_country.value,
                            "countryCodeAlpha2": this.profile.shipping_country.value,
                            "locality": this.profile.shipping_city,
                            "region": this.profile.shipping_state.value
                        },
                        "phone": this.profile.phone_number.split(/.{1,3}/g).join("-"),
                        "countryCode": this.profile.billing_country.value,
                        "billingAddress": {
                            "recipientName": `${this.profile.billing_first_name} ${this.profile.billing_last_name}`,
                            "line1": this.profile.billing_address_line_1,
                            ...(this.profile.billing_address_line_2 && {"line2":this.profile.billing_address_line_2}),
                            "city": this.profile.billing_city,
                            "state": this.profile.billing_state.value,
                            "postalCode": this.profile.billing_zip_code,
                            "countryCode": this.profile.billing_country.value,
                            "countryCodeAlpha2": this.profile.billing_country.value,
                            "locality": this.profile.billing_city,
                            "region": this.profile.billing_state.value
                        }
                    },
                    "type": "PayPalAccount"
                };

                if (cancelled || !this.state.started || this.state.stopped) return;

                this.request({
                    url: `https://${this.variables.static.host.value}/api/users/carts/current/paypal?timestamp=${Date.now()}`,
                    method: "POST",
                    headers: {
                        "accept": "application/json",
                        "accept-encoding": "gzip, deflate, br",
                        "accept-language": "en-US,en;q=0.9",
                        "cache-control": "no-cache",
                        "content-type": "application/json",
                        "origin": `https://${this.variables.static.host.value}`,
                        "pragma": "no-cache",
                        "referer": `https://${this.variables.static.host.value}/checkout`,
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin",
                        "user-agent": `${this.variables.static.userAgent}`,
                        "x-csrf-token": `${this.variables.dynamic.csrfToken}`,
                        "x-fl-request-id": `${this.randomUUIDV1()}`
                    },
                    cookieJar: this.variables.static.cookieJar,
                    proxy: this.runArgs.proxy.current.parsed,
                    body: JSON.stringify(data)
                }, async (err, res) => {
                    if (cancelled || !this.state.started || this.state.stopped) return;
                    try {
                        if (err) {
                            this.sendStatusMessage({id: this.id, msg: `Error Submitting Paypal (Request)`, status: "warning"});
                            return reject();
                        } else {
                            if (res.statusCode === 200) {
                                return resolve();
                            } else if (res.statusCode === 403) {
                                if (res.headers["server"] && res.headers["server"] === "AkamaiGHost") {
                                    await this.variables.static.akamai.generate();
                                    return reject();
                                } else if (res.headers["server"] && res.headers["server"] === "DataDome") {
                                    const _params = new URLSearchParams(/^[^?#]+\?([^#]+)/.exec(JSON.parse(res.body).url)[1]);
                                    this.variables.dynamic.datadomeUrl = JSON.parse(res.body).url;
                                    await this.solveDatadome();
                                    return reject();
                                } else {
                                    this.sendStatusMessage({id: this.id, msg: `Error Submitting Paypal (Blocked By PerimeterX)`, status: "error"});
                                    this.stopTask();
                                    return;
                                }
                            } else if (res.statusCode.toString().startsWith("5") && res.body.includes('HTTP-EQUIV="Refresh"')) {
                                await this.solveQueue();
                                return reject();
                            } else {
                                this.sendStatusMessage({id: this.id, msg: `Error Submitting Paypal (Status ${res.statusCode})`, status: "warning"});
                                return reject();
                            }
                        }
                    } catch (err) {
                        this.sendStatusMessage({id: this.id, msg: `Error Submitting Paypal (Catch Request)`, status: "warning"})
                        return reject();
                    }
                })
            } catch (err) {
                this.sendStatusMessage({id: this.id, msg: `Error Submitting Paypal (Catch Full)`, status: "warning"})
                return reject();
            }
        })
    }

    submitOrder() {
        return new Promise(async (resolve, reject, onCancel) => {
            let cancelled = false;
            onCancel(() => { cancelled = true });
            try {

                this.sendStatusMessage({id: this.id, msg: `Submitting Order`, status: "status"});

                const data = {
                    "preferredLanguage": "en",
                    "termsAndCondition": false,
                    "deviceId": true,
                    "cartId": this.variables.dynamic.cartID,
                    ...(this.runArgs.mode === "Card" && {"encryptedCardNumber": this.variables.static.adyen.encrypt({number: this.profile.card_number.match(/.{1,4}/g).join(" "), generationTime: new Date().toISOString()}) }),
                    ...(this.runArgs.mode === "Card" && {"encryptedExpiryMonth": this.variables.static.adyen.encrypt({expiryMonth: this.profile.card_expiry_month.value, generationTime: new Date().toISOString()}) }),
                    ...(this.runArgs.mode === "Card" && {"encryptedExpiryYear": this.variables.static.adyen.encrypt({expiryYear: this.profile.card_expiry_year.value, generationTime: new Date().toISOString()}) }),
                    ...(this.runArgs.mode === "Card" && {"encryptedSecurityCode": this.variables.static.adyen.encrypt({cvc: this.profile.card_security_code, generationTime: new Date().toISOString()}) }),
                    ...(this.runArgs.mode === "Card" && {"paymentMethod": "CREDITCARD"}),
                    ...(this.runArgs.mode === "Card" && {"returnUrl": "https://www.footlocker.com/adyen/checkout"}),
                    ...(this.runArgs.mode === "Card" && {
                        "browserInfo": {
                            "screenWidth": 1920,
                            "screenHeight": 1080,
                            "colorDepth": 24,
                            "userAgent": this.variables.static.userAgent,
                            "timeZoneOffset": 240,
                            "language": "en-US",
                            "javaEnabled": false
                        }
                    }),
                };

                if (cancelled || !this.state.started || this.state.stopped) return;

                this.request({
                    url: `https://${this.variables.static.host.value}/api/v2/users/orders?timestamp=${Date.now()}`,
                    method: "POST",
                    headers: {
                        "accept": "application/json",
                        "accept-encoding": "gzip, deflate, br",
                        "accept-language": "en-US,en;q=0.9",
                        "cache-control": "no-cache",
                        "content-type": "application/json",
                        "origin": `https://${this.variables.static.host.value}`,
                        "pragma": "no-cache",
                        "referer": `https://${this.variables.static.host.value}/checkout`,
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin",
                        "user-agent": `${this.variables.static.userAgent}`,
                        "x-csrf-token": `${this.variables.dynamic.csrfToken}`,
                        "x-fl-request-id": `${this.randomUUIDV1()}`
                    },
                    cookieJar: this.variables.static.cookieJar,
                    proxy: this.runArgs.proxy.current.parsed,
                    body: JSON.stringify(data)
                }, async (err, res) => {
                    if (cancelled || !this.state.started || this.state.stopped) return;
                    try {
                        if (err) {
                            this.sendStatusMessage({id: this.id, msg: `Error Submitting Order (Request)`, status: "warning"});
                            return reject();
                        }
                        else {
                            if (res.statusCode === 200) {
                                this.sendStatusMessage({id: this.id, msg: `Checked Out`, status: "success"});
                                try {
                                    this.orderCallback({order: {
                                        type: 'success',
                                        id: undefined,
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
                                    return this.stopTask()
                                }
                            } else if (res.statusCode === 403) {
                                if (res.headers["server"] && res.headers["server"] === "AkamaiGHost") {
                                    await this.variables.static.akamai.generate();
                                    return reject();
                                } else if (res.headers["server"] && res.headers["server"] === "DataDome") {
                                    this.variables.dynamic.datadomeUrl = JSON.parse(res.body).url;
                                    await this.solveDatadome();
                                    return reject();
                                } else {
                                    this.sendStatusMessage({id: this.id, msg: `Error Submitting Order (Blocked By PerimeterX)`, status: "error"});
                                    this.stopTask();
                                    return;
                                }
                            } else if (res.statusCode.toString().startsWith("5") && res.body.includes('HTTP-EQUIV="Refresh"')) {
                                await this.solveQueue();
                                return reject();
                            } else if (res.statusCode === 400) {
                                const resJSON = JSON.parse(res.body);
                                if (resJSON.errors) {
                                    if (resJSON.errors.find(error => error.message === "Something isn't right. We suggest you try again or use another payment method.")) {
                                        this.sendStatusMessage({id: this.id, msg: `Payment Declined`, status: "error"});
                                        try {
                                            this.orderCallback({order: {
                                                type: 'decline',
                                                id: undefined,
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
                                            return this.stopTask()
                                        }
                                    } else if (resJSON.errors.find(error => error.message === "Invalid Payment details.")) {
                                        this.sendStatusMessage({id: this.id, msg: `Invalid Payment Details`, status: "error"});
                                        this.stopTask();
                                        return;
                                    } else {
                                        console.log(resJSON)
                                        this.sendStatusMessage({id: this.id, msg: `Error Submitting Order (Payment Error, status: Status ${res.statusCode})`, status: 'error'});
                                        this.stopTask();
                                        return;    
                                    }
                                } else {
                                    this.sendStatusMessage({id: this.id, msg: `Error Submitting Order (Status ${res.statusCode})`, status: "warning"});
                                    return;
                                }
                            } else {
                                this.sendStatusMessage({id: this.id, msg: `Error Submitting Order (Status ${res.statusCode})`, status: "warning"});
                                return reject();
                            }
                        }
                    } catch (err) {
                        this.sendStatusMessage({id: this.id, msg: `Error Submitting Order (Catch Request)`, status: "warning"})
                        return reject();
                    }
                })
            } catch (err) {
                this.sendStatusMessage({id: this.id, msg: `Error Submitting Order (Catch Full)`, status: "warning"})
                return reject();
            }
        })
    }

    paypalFlow() {
        const task = this;
        const initializeSessionWrapper = async () => {
            task.state.promises["initializeSession"] = task.initializeSession().then(async () => {
                await task.monitorDelay();
                // const getProductPageWrapper = async () => {
                //     task.state.promises["getProductPage"] = task.getProductPage().then(async () => {
                //         await task.monitorDelay()
                        const getProductInfoWrapper = async () => {
                            task.state.promises["getProductInfo"] = task.getProductInfo().then(async () => {
                                await task.monitorDelay();
                                const addToCartWrapper = async () => {
                                    task.state.promises["addToCart"] = task.addToCart().then(async () => {
                                        await task.monitorDelay();
                                        const initializePaypalWrapper = async () => {
                                            task.state.promises["initializePaypal"] = task.initializePaypal().then(async () => {
                                                await task.monitorDelay();
                                                const submitPaypalDetailsWrapper = async () => {
                                                    task.state.promises["submitPaypalDetails"] = task.submitPaypalDetails().then(async () => {
                                                        await task.monitorDelay();
                                                        const approvePaypalWrapper = async () => {
                                                            task.state.promises["approvePaypal"] = task.approvePaypal().then(async () => {
                                                                await task.monitorDelay();
                                                                const submitPaypalAccountWrapper = async () => {
                                                                    task.state.promises["submitPaypalAccount"] = task.submitPaypalAccount().then(async () => {
                                                                        await task.monitorDelay();
                                                                        const submitPaypalWrapper = async () => {
                                                                            task.state.promises["submitPaypal"] = task.submitPaypal().then(async () => {
                                                                                await task.monitorDelay();
                                                                                const submitOrderWrapper = async () => {
                                                                                    task.state.promises["submitOrder"] = task.submitOrder().then(async () => {                                                                                
                                                                                    }).catch((err) => { task.state.timeouts["submitOrder"] = setTimeout(submitOrderWrapper, task.runArgs.retry_delay); })
                                                                                }
                                                                                submitOrderWrapper();
                                                                            }).catch((err) => { task.state.timeouts["submitPaypal"] = setTimeout(submitPaypalWrapper, task.runArgs.retry_delay); })
                                                                        }
                                                                        submitPaypalWrapper();        
                                                                    }).catch((err) => { task.state.timeouts["submitPaypalAccount"] = setTimeout(submitPaypalAccountWrapper, task.runArgs.retry_delay); })
                                                                }
                                                                submitPaypalAccountWrapper();
                                                            }).catch((err) => { task.state.timeouts["approvePaypal"] = setTimeout(approvePaypalWrapper, task.runArgs.retry_delay); })
                                                        }
                                                        approvePaypalWrapper();        
                                                    }).catch((err) => { task.state.timeouts["submitPaypalDetails"] = setTimeout(submitPaypalDetailsWrapper, task.runArgs.retry_delay); })
                                                }
                                                submitPaypalDetailsWrapper();
                                            }).catch((err) => { task.state.timeouts["initializePaypal"] = setTimeout(initializePaypalWrapper, task.runArgs.retry_delay); })
                                        }
                                        initializePaypalWrapper();        
                                    }).catch((err) => { task.state.timeouts["addToCart"] = setTimeout(addToCartWrapper, task.runArgs.retry_delay); })
                                }
                                addToCartWrapper();
                            }).catch((err) => { task.state.timeouts["getProductInfo"] = setTimeout(getProductInfoWrapper, task.runArgs.retry_delay); })
                        }
                        getProductInfoWrapper();        
                //     }).catch((err) => { task.state.timeouts["getProductPage"] = setTimeout(getProductPageWrapper, task.runArgs.retry_delay); })
                // }
                // getProductPageWrapper();
            }).catch((err) => { task.state.timeouts["initializeSession"] = setTimeout(initializeSessionWrapper, task.runArgs.retry_delay); })
        }
        initializeSessionWrapper();
    }

    cardFlow() {
        const task = this;
        const initializeSessionWrapper = async () => {
            task.state.promises["initializeSession"] = task.initializeSession().then(async () => {
                await task.monitorDelay();
                // const getProductPageWrapper = async () => {
                //     task.state.promises["getProductPage"] = task.getProductPage().then(async () => {
                //         await task.monitorDelay()
                        const getProductInfoWrapper = async () => {
                            task.state.promises["getProductInfo"] = task.getProductInfo().then(async () => {
                                await task.monitorDelay();
                                const addToCartWrapper = async () => {
                                    task.state.promises["addToCart"] = task.addToCart().then(async () => {
                                        await task.monitorDelay();
                                        const submitEmailWrapper = async () => {
                                            task.state.promises["submitEmail"] = task.submitEmail().then(async () => {
                                                await task.monitorDelay();
                                                const submitShippingAddressWrapper = async () => {
                                                    task.state.promises["submitShippingAddress"] = task.submitShippingAddress().then(async () => {
                                                        await task.monitorDelay();
                                                        const submitBillingAddressWrapper = async () => {
                                                            task.state.promises["submitBillingAddress"] = task.submitBillingAddress().then(async () => {
                                                                await task.monitorDelay();
                                                                const submitOrderWrapper = async () => {
                                                                    task.state.promises["submitOrder"] = task.submitOrder().then(async () => {
                                                                    }).catch((err) => { task.state.timeouts["submitOrder"] = setTimeout(submitOrderWrapper, task.runArgs.retry_delay); })
                                                                }
                                                                submitOrderWrapper();                        
                                                            }).catch((err) => { task.state.timeouts["submitBillingAddress"] = setTimeout(submitBillingAddressWrapper, task.runArgs.retry_delay); })
                                                        }
                                                        submitBillingAddressWrapper();                
                                                    }).catch((err) => { task.state.timeouts["submitShippingAddress"] = setTimeout(submitShippingAddressWrapper, task.runArgs.retry_delay); })
                                                }
                                                submitShippingAddressWrapper();        
                                            }).catch((err) => { task.state.timeouts["submitEmail"] = setTimeout(submitEmailWrapper, task.runArgs.retry_delay); })
                                        }
                                        submitEmailWrapper();
                                    }).catch((err) => { task.state.timeouts["addToCart"] = setTimeout(addToCartWrapper, task.runArgs.retry_delay); })
                                }
                                addToCartWrapper();
                            }).catch((err) => { task.state.timeouts["getProductInfo"] = setTimeout(getProductInfoWrapper, task.runArgs.retry_delay); })
                        }
                        getProductInfoWrapper();        
                //     }).catch((err) => { task.state.timeouts["getProductPage"] = setTimeout(getProductPageWrapper, task.runArgs.retry_delay); })
                // }
                // getProductPageWrapper();
            }).catch((err) => { task.state.timeouts["initializeSession"] = setTimeout(initializeSessionWrapper, task.runArgs.retry_delay); })
        }
        initializeSessionWrapper();
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
                    case "Card":
                        this.cardFlow();
                        break;
                    case "Paypal":
                        this.paypalFlow();
                        break;    
                    default:
                        this.cardFlow();
                        break;
                }
                
                return callback ? callback({success: true}) : true;
            } else {
                return callback ? callback({success: false, err: 'Already Started'}) : false;
            }
        }
        catch (err) {
            console.error(err)
            return callback ? callback({success: false, err: 'Catch Full'}) : false;
        }
    }

}

module.exports = US_FOOTSITES;
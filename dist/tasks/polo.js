'use strict';

const Promise = require("bluebird");
const Task = require("./");
const AdyenEncrypt = require("./adyen");
const CookieJar = require("./capsuleCookie");

Promise.config({
    cancellation: true,
    longStackTraces: true
});

class TEMPLATE extends Task {
    constructor({ id, group, profile, runArgs, productArgs, loginArgs, webhookArgs, sendStatusMessage, solveCaptcha, getNokamai, getPixel, getInitialFingerprint, getSharedResource, setPrioritySharedResource, openBrowser, orderCallback, requestNewProxy, request, sendAnalytic }) {
        super({id, group, profile, runArgs, productArgs, loginArgs, webhookArgs, sendStatusMessage, solveCaptcha, getNokamai, getPixel, getInitialFingerprint, getSharedResource, setPrioritySharedResource, openBrowser, orderCallback, requestNewProxy, request, sendAnalytic});

        this.variables.static.userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36";

        this.loginArgs = {
            username: '',
            password: '',
        }
        
        this.variables.static.precart_pid = '0045430907'

        this.variables.static.predict_spring = {
            api_key: 'KJmsuvA6pq4O38TB77g68tTz',
            device: 'Ipod',
            merchant_id: 'RALPHLAUREN178933',
            region: 'US',
            locale: 'en_US',
            installation_id: '5f388564-a703-4396-a202-be3fdae0ede1',
            user_agent: 'RalphLauren/22437 CFNetwork/1312 Darwin/21.0.0'
        }

        this.variables.static.mobile_cookieJar = new CookieJar()

        this.variables.static.adyen = new AdyenEncrypt({
            key: '10001|99E1D93CFAF113FE7F896E2BC4AF0543D4EA1EA6FE15E472FD30B0DF7E5C12439CAB39DAF4CE9AD92F6B2CFA73FE4262DC6A595EBB799DD93D106EA1CE46D92AA8AE6320B5790046EAE0106988BBC9160184BD67A10A71BD81B47AAD9FA2F08497B3B81C87B9CC60ACC2DC62FBC6631BC3C762D9E92645855F31FAABB8891C0BBF8308740882C6198987D11AB80D2215B26E40097EA7C8DAEAF3E1985A5B124F4412275039E7D51735D102796F8AF2B8A4C53C6098BC77B8731B77CD5DACA3A91E00F103CF73C180EFFD45B92FCDF5CED191275F19E8DEF977499CC038C26A11A51B1E3B2D878BCA6BCFC652091885684D19642648F4429540A1291CC65B703D',
            version: '0_1_25'
        })

        switch (this.runArgs.site) {
            case "POLO":
                this.variables.static.mobile_host = 'cloudservices.predictspring.com';
                this.variables.static.desktop_host = 'www.ralphlauren.com';
                break;
        }

        this.variables.static.user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36'
    }

    mobileSignIn() {
        return new Promise(async (resolve, reject, onCancel) => {
            let cancelled = false;
            onCancel(() => { cancelled = true; });
            try {
                this.sendStatusMessage({id: this.id, msg: `Logging In On Mobile`, status: "status"})

                const data = {
                    'credentials.userId': this.loginArgs.username,
                    'credentials.password': this.loginArgs.password,
                    'loyaltyFilter' : {
                      'includeUsedOrExpiredRewards': true
                    },
                    'psDevice' : {
                      'deviceOS' : 'IOS'
                    },
                    'ps_password' : 'credentials.password',
                    'ps_username' : 'credentials.userId'
                }
                
                if (cancelled || !this.state.started || this.state.stopped) return;

                this.request({
                    url: `https://${this.variables.static.mobile_host}/search/v2/customer/login`,
                    method: 'POST',
                    headers: {
                        'accept': 'application/json',
                        'accept-language': 'en-us',
                        'accept-encoding': 'gzip, deflate, br',
                        'content-type': 'application/json',
                        'predictspring-api-key': this.variables.static.predict_spring.api_key,
                        'predictspring-devicename': this.variables.static.predict_spring.device,
                        'predictspring-installationid': this.variables.static.predict_spring.installation_id,
                        'predictspring-locale': this.variables.static.predict_spring.locale,
                        'predictspring-merchantid': this.variables.static.predict_spring.merchant_id,
                        'predictspring-region': this.variables.static.predict_spring.region,
                        'user-agent': this.variables.static.predict_spring.user_agent
                    },
                    cookieJar: this.variables.static.mobile_cookieJar,
                    proxy: this.runArgs.proxy.current.parsed,
                    body: JSON.stringify(data)
                }, async (err, res) => {
                    if (cancelled || !this.state.started || this.state.stopped) return;
                    try {
                        if (err) {
                            this.sendStatusMessage({id: this.id, msg: `Error Logging In On Mobile (Request)`, status: "warning"});
                            return reject();
                        } else {
                            if (res.statusCode === 200) {
                                const resJSON = JSON.parse(res.body)

                                if (resJSON.sessionId && resJSON.profile?.customerId) {
                                    this.variables.dynamic.customerId = resJSON.profile.customerId
                                    this.variables.dynamic.sessionId = resJSON.sessionId
                                    return resolve()
                                } else { 
                                    this.sendStatusMessage({id: this.id, msg: 'Error Logging In On Mobile (Not Found)', status: 'error'})
                                    this.stopTask()
                                }
                            } else {
                                this.sendStatusMessage({id: this.id, msg: `Error Logging In On Mobile (Status ${res.statusCode})`, status: "warning"});
                                return reject();
                            }
                        }
                    } catch (err) {
                        this.sendStatusMessage({id: this.id, msg: `Error Logging In On Mobile (Catch Request)`, status: "warning"});
                        return reject();
                    }
                })
            } catch (err) {
                this.sendStatusMessage({id: this.id, msg: `Error Logging In On Mobile (Catch Full)`, status: "warning"});
                return reject();
            }
        })
    }

    mobilePreCart() {
        return new Promise(async (resolve, reject, onCancel) => {
            let cancelled = false;
            onCancel(() => { cancelled = true; });
            try {
                this.sendStatusMessage({id: this.id, msg: `Precarting`, status: "status"})

                const data = {
                    "checkoutType": "NATIVE",
                    "cartItemList": [{
                        "quantity": "1",
                        "productId": this.variables.static.precart_pid,
                    }],
                    "promotionCodes": [],
                    "paymentData": {
                        "paymentType": "CreditCard"
                    },
                    "orderSource": "ONLINE",
                    "storeId": "",
                    "rewardList": [],
                    "installationId": this.variables.static.predict_spring.installationId,
                    "customerGroups": [],
                    "giftCardList": [],
                    "appliedCashRewards": [],
                    "customerEmail": this.loginArgs.username
                }
                
                if (cancelled || !this.state.started || this.state.stopped) return;

                this.request({
                    url: `https://${this.variables.static.mobile_host}/search/v1/customer/${this.variables.dynamic.customerId}/cart`,
                    method: 'POST',
                    headers: {
                        'accept': 'application/json',
                        'accept-language': 'en-us',
                        'accept-encoding': 'gzip, deflate, br',
                        'content-type': 'application/json',
                        'predictspring-api-key': this.variables.static.predict_spring.api_key,
                        'predictspring-devicename': this.variables.static.predict_spring.device,
                        'predictspring-installationid': this.variables.static.predict_spring.installation_id,
                        'predictspring-locale': this.variables.static.predict_spring.locale,
                        'predictspring-merchantid': this.variables.static.predict_spring.merchant_id,
                        'predictspring-region': this.variables.static.predict_spring.region,
                        'predictspring-sessionid': this.variables.dynamic.sessionId,
                        'user-agent': this.variables.static.predict_spring.user_agent
                    },
                    cookieJar: this.variables.static.mobile_cookieJar,
                    proxy: this.runArgs.proxy.current.parsed,
                    body: JSON.stringify(data)
                }, async (err, res) => {
                    if (cancelled || !this.state.started || this.state.stopped) return;
                    try {
                        if (err) {
                            this.sendStatusMessage({id: this.id, msg: `Error Precarting (Request)`, status: "warning"});
                            return reject();
                        }
                        else {
                            if (res.statusCode === 200) {
                                const resJSON = JSON.parse(res.body)
                                if (resJSON?.cartId && resJSON?.cartItemList?.[0]?.orderItemId)
                                    this.variables.dynamic.cartId = resJSON.cartId
                                    this.variables.dynamic.orderItemId = resJSON?.cartItemList?.[0]?.orderItemId
                                return resolve();
                            } else {
                                this.sendStatusMessage({id: this.id, msg: `Error Precarting (Status ${res.statusCode})`, status: "warning"});
                                return reject();
                            }
                        }
                    } catch (err) {
                        this.sendStatusMessage({id: this.id, msg: `Error Precarting (Catch Request)`, status: "warning"});
                        return reject();
                    }
                })
            }
            catch (err) {
                this.sendStatusMessage({id: this.id, msg: `Error Precarting (Catch Full)`, status: "warning"});
                return reject();
            }
        })
    }

    mobileAddToCart() {
        return new Promise(async (resolve, reject, onCancel) => {
            let cancelled = false;
            onCancel(() => { cancelled = true; });
            try {
                this.sendStatusMessage({id: this.id, msg: `Adding To Cart`, status: "status"})

                console.log(this.productArgs.pid)

                const data = {
                    "checkoutType": "NATIVE",
                    "cartItemList": [{
                        "quantity": "1",
                        "productId": this.productArgs.pid,
                    }],
                    "promotionCodes": [],
                    "paymentData": {
                        "paymentType": "CreditCard"
                    },
                    "orderSource": "ONLINE",
                    "storeId": "",
                    "rewardList": [],
                    "installationId": this.variables.static.predict_spring.installationId,
                    "customerGroups": [],
                    "giftCardList": [],
                    "appliedCashRewards": [],
                    "customerEmail": this.loginArgs.username
                }
                
                if (cancelled || !this.state.started || this.state.stopped) return;

                this.request({
                    url: `https://${this.variables.static.mobile_host}/search/v1/customer/${this.variables.dynamic.customerId}/cart`,
                    method: 'POST',
                    headers: {
                        'accept': 'application/json',
                        'accept-language': 'en-us',
                        'accept-encoding': 'gzip, deflate, br',
                        'content-type': 'application/json',
                        'predictspring-api-key': this.variables.static.predict_spring.api_key,
                        'predictspring-devicename': this.variables.static.predict_spring.device,
                        'predictspring-installationid': this.variables.static.predict_spring.installation_id,
                        'predictspring-locale': this.variables.static.predict_spring.locale,
                        'predictspring-merchantid': this.variables.static.predict_spring.merchant_id,
                        'predictspring-region': this.variables.static.predict_spring.region,
                        'predictspring-sessionid': this.variables.dynamic.sessionId,
                        'user-agent': this.variables.static.predict_spring.user_agent
                    },
                    cookieJar: this.variables.static.mobile_cookieJar,
                    proxy: this.runArgs.proxy.current.parsed,
                    body: JSON.stringify(data)
                }, async (err, res) => {
                    if (cancelled || !this.state.started || this.state.stopped) return;
                    try {
                        if (err) {
                            this.sendStatusMessage({id: this.id, msg: `Error Adding To Cart (Request)`, status: "warning"});
                            return reject();
                        }
                        else {
                            if (res.statusCode === 200) {
                                return resolve();
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
            }
            catch (err) {
                this.sendStatusMessage({id: this.id, msg: `Error Adding To Cart (Catch Full)`, status: "warning"});
                return reject();
            }
        })
    }


    mobileRemovePrecart() {
        return new Promise(async (resolve, reject, onCancel) => {
            let cancelled = false;
            onCancel(() => { cancelled = true; });
            try {
                this.sendStatusMessage({id: this.id, msg: `Removing Precart`, status: "status"})

                const data = {
                    "customerEmail": this.loginArgs.username,
                    "appliedCashRewards": [],
                    "orderSource": "ONLINE",
                    "promotionCodes": [],
                    "giftCardList": [],
                    "cartItemList": [{
                        "oldQuantity": "1",
                        "orderItemId": this.variables.dynamic.orderItemId,
                        "quantity": "0",
                        "productId": this.variables.static.precart_pid,
                    }],
                    "productId": this.variables.static.precart_pid,
                    "checkoutType": "NATIVE",
                    "customerGroups": [],
                    "paymentData": {
                        "paymentType": "CreditCard"
                    },
                    "installationId": this.variables.static.predict_spring.installation_id,
                    "oldQuantity": 1,
                    "cartId": this.variables.dynamic.cartId,
                    "orderItemId": this.variables.dynamic.orderItemId,
                    "newQuantity": 0,
                    "storeId": "",
                    "rewardList": [],
                }
                
                if (cancelled || !this.state.started || this.state.stopped) return;

                this.request({
                    url: `https://${this.variables.static.mobile_host}/search/v1/customer/${this.variables.dynamic.customerId}/cart/product/update`,
                    method: 'POST',
                    headers: {
                        'accept': 'application/json',
                        'accept-language': 'en-us',
                        'accept-encoding': 'gzip, deflate, br',
                        'content-type': 'application/json',
                        'predictspring-api-key': this.variables.static.predict_spring.api_key,
                        'predictspring-devicename': this.variables.static.predict_spring.device,
                        'predictspring-installationid': this.variables.static.predict_spring.installation_id,
                        'predictspring-locale': this.variables.static.predict_spring.locale,
                        'predictspring-merchantid': this.variables.static.predict_spring.merchant_id,
                        'predictspring-region': this.variables.static.predict_spring.region,
                        'predictspring-sessionid': this.variables.dynamic.sessionId,
                        'user-agent': this.variables.static.predict_spring.user_agent
                    },
                    cookieJar: this.variables.static.mobile_cookieJar,
                    proxy: this.runArgs.proxy.current.parsed,
                    body: JSON.stringify(data)
                }, async (err, res) => {
                    if (cancelled || !this.state.started || this.state.stopped) return;
                    try {
                        if (err) {
                            this.sendStatusMessage({id: this.id, msg: `Error Removing Precart (Request)`, status: "warning"});
                            return reject();
                        }
                        else {
                            if (res.statusCode === 200) {
                                return resolve();
                            } else {
                                this.sendStatusMessage({id: this.id, msg: `Error Removing Precart (Status ${res.statusCode})`, status: "warning"});
                                return reject();
                            }
                        }
                    } catch (err) {
                        this.sendStatusMessage({id: this.id, msg: `Error Removing Precart (Catch Request)`, status: "warning"});
                        return reject();
                    }
                })
            } catch (err) {
                this.sendStatusMessage({id: this.id, msg: `Error Removing Precart (Catch Full)`, status: "warning"});
                return reject();
            }
        })
    }

    desktopInitializeLogin() {
        return new Promise(async (resolve, reject, onCancel) => {
            let cancelled = false;
            onCancel(() => { cancelled = true; });
            try {
                this.sendStatusMessage({id: this.id, msg: `Initializing Desktop Login`, status: "status"})

                if (cancelled || !this.state.started || this.state.stopped) return;

                this.request({
                    url: `https://${this.variables.static.desktop_host}/accountlogin`,
                    method: 'GET',
                    headers: {
                        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                        'accept-encoding': 'gzip, deflate, br',
                        'accept-language': 'en-US,en;q=0.9',
                        'cache-control': 'no-cache',
                        'pragma': 'no-cache',
                        'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="96", "Google Chrome";v="96"',
                        'sec-ch-ua-mobile': '?0',
                        'sec-ch-ua-platform': '"Windows"',
                        'sec-fetch-dest': 'document',
                        'sec-fetch-mode': 'navigate',
                        'sec-fetch-site': 'none',
                        'sec-fetch-user': '?1',
                        'upgrade-insecure-requests': '1',
                        'user-agent': this.variables.static.user_agent
                    },
                    cookieJar: this.variables.static.cookieJar,
                    proxy: this.runArgs.proxy.current.parsed
                }, async (err, res) => {
                    if (cancelled || !this.state.started || this.state.stopped) return;
                    try {
                        if (err) {
                            this.sendStatusMessage({id: this.id, msg: `Error Initializing Desktop Login (Request)`, status: "warning"});
                            return reject();
                        } else {
                            if (res.statusCode === 200) {
                                this.variables.dynamic.username_form_id = /(for="dwfrm_login_username_)(.*?)(")/.exec(res.body)[2]
                                this.variables.dynamic.password_form_id = /(for="dwfrm_login_password_)(.*?)(")/.exec(res.body)[2]
                                this.variables.dynamic.csrf_token = /(name="csrf_token")(.*?)(value=")(.*?)(")/.exec(res.body)[4]
                                return resolve()
                            } else if (res.statusCode === 403) {
                                this.sendStatusMessage({id: this.id, msg: 'Blocked By PerimeterX', status: 'warning'})
                                await this.requestNewProxy({id: this.id})
                                return reject()
                            } else {
                                this.sendStatusMessage({id: this.id, msg: `Error Initializing Desktop Login (Status ${res.statusCode})`, status: "warning"});
                                return reject();
                            }
                        }
                    } catch (err) {
                        this.sendStatusMessage({id: this.id, msg: `Error Initializing Desktop Login (Catch Request)`, status: "warning"});
                        return reject();
                    }
                })
            } catch (err) {
                this.sendStatusMessage({id: this.id, msg: `Error Initializing Desktop Login (Catch Full)`, status: "warning"});
                return reject();
            }
        })
    }

    desktopLogin() {
        return new Promise(async (resolve, reject, onCancel) => {
            let cancelled = false;
            onCancel(() => { cancelled = true; });
            try {
                this.sendStatusMessage({id: this.id, msg: `Logging In On Desktop`, status: "status"})

                const data = new URLSearchParams({
                    [`dwfrm_login_username_${this.variables.dynamic.username_form_id}`]: this.loginArgs.username,
                    [`dwfrm_login_password_${this.variables.dynamic.password_form_id}`]: this.loginArgs.password,
                    dwfrm_login_rememberme: true,
                    dwfrm_login_login: 'Sign In',
                    csrf_token: this.variables.dynamic.csrf_token,
                    LoginLocation: 'MyAccountLogin',
                    dwfrm_login_login: true
                })
                                
                if (cancelled || !this.state.started || this.state.stopped) return;

                this.request({
                    url: `https://${this.variables.static.desktop_host}/on/demandware.store/Sites-RalphLauren_US-Site/en_US/Login-LoginForm?scope=`,
                    method: 'POST',
                    headers: {
                        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                        'accept-encoding': 'gzip, deflate, br',
                        'accept-language': 'en-US,en;q=0.9',
                        'cache-control': 'no-cache',
                        'content-type': 'application/x-www-form-urlencoded',
                        'origin': `https://${this.variables.static.desktop_host}`,
                        'pragma': 'no-cache',
                        'referer': `https://${this.variables.static.desktop_host}/accountlogin`,
                        'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="96", "Google Chrome";v="96"',
                        'sec-ch-ua-mobile': '?0',
                        'sec-ch-ua-platform': '"Windows"',
                        'sec-fetch-dest': 'document',
                        'sec-fetch-mode': 'navigate',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-user': '?1',
                        'upgrade-insecure-requests': '1',
                        'user-agent': this.variables.static.user_agent
                    },
                    cookieJar: this.variables.static.cookieJar,
                    proxy: this.runArgs.proxy.current.parsed,
                    body: data.toString()
                }, async (err, res) => {
                    if (cancelled || !this.state.started || this.state.stopped) return;
                    try {
                        if (err) {
                            this.sendStatusMessage({id: this.id, msg: `Error Logging In On Desktop (Request)`, status: "warning"});
                            return reject();
                        } else {
                            if (res.statusCode === 302) {
                                return resolve()
                            } else if (res.statusCode === 403) {
                                this.sendStatusMessage({id: this.id, msg: 'Blocked By PerimeterX', status: 'warning'})
                                await this.requestNewProxy({id: this.id})
                                return reject()
                            } else {
                                this.sendStatusMessage({id: this.id, msg: `Error Logging In On Desktop (Status ${res.statusCode})`, status: "warning"});
                                return reject();
                            }
                        }
                    } catch (err) {
                        this.sendStatusMessage({id: this.id, msg: `Error Logging In On Desktop (Catch Request)`, status: "warning"});
                        return reject();
                    }
                })
            } catch (err) {
                this.sendStatusMessage({id: this.id, msg: `Error Logging In On Desktop (Catch Full)`, status: "warning"});
                return reject();
            }
        })
    }

    desktopInitializeShipping() {
        return new Promise(async (resolve, reject, onCancel) => {
            let cancelled = false;
            onCancel(() => { cancelled = true; });
            try {
                this.sendStatusMessage({id: this.id, msg: `Initializing Shipping`, status: "status"})

                if (cancelled || !this.state.started || this.state.stopped) return;

                this.request({
                    url: `https://${this.variables.static.desktop_host}/shipping`,
                    method: 'GET',
                    headers: {
                        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                        'accept-encoding': 'gzip, deflate, br',
                        'accept-language': 'en-US,en;q=0.9',
                        'cache-control': 'no-cache',
                        'origin': `https://${this.variables.static.desktop_host}`,
                        'pragma': 'no-cache',
                        'referer': `https://${this.variables.static.desktop_host}/cart`,
                        'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="96", "Google Chrome";v="96"',
                        'sec-ch-ua-mobile': '?0',
                        'sec-ch-ua-platform': '"Windows"',
                        'sec-fetch-dest': 'document',
                        'sec-fetch-mode': 'navigate',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-user': '?1',
                        'upgrade-insecure-requests': '1',
                        'user-agent': this.variables.static.user_agent
                    },
                    cookieJar: this.variables.static.cookieJar,
                    proxy: this.runArgs.proxy.current.parsed
                }, async (err, res) => {
                    if (cancelled || !this.state.started || this.state.stopped) return;
                    try {
                        if (err) {
                            this.sendStatusMessage({id: this.id, msg: `Error Initializing Shipping (Request)`, status: "warning"});
                            return reject();
                        } else {
                            if (res.statusCode === 200) {
                                this.variables.dynamic.shipping_csrf_token = /(name="csrf_token")(.*?)(value=")(.*?)(")/.exec(res.body)[4]
                                return resolve()
                            } else if (res.statusCode === 403) {
                                this.sendStatusMessage({id: this.id, msg: 'Blocked By PerimeterX', status: 'warning'})
                                await this.requestNewProxy({id: this.id})
                                return reject()
                            } else {
                                this.sendStatusMessage({id: this.id, msg: `Error Initializing Shipping (Status ${res.statusCode})`, status: "warning"});
                                return reject();
                            }
                        }
                    } catch (err) {
                        this.sendStatusMessage({id: this.id, msg: `Error Initializing Shipping (Catch Request)`, status: "warning"});
                        return reject();
                    }
                })
            } catch (err) {
                this.sendStatusMessage({id: this.id, msg: `Error Initializing Shipping (Catch Full)`, status: "warning"});
                return reject();
            }
        })
    }

    desktopSubmitShippingInfo() {
        return new Promise(async (resolve, reject, onCancel) => {
            let cancelled = false;
            onCancel(() => { cancelled = true; });
            try {
                this.sendStatusMessage({id: this.id, msg: `Submitting Shipping Info`, status: "status"})

                const data = new URLSearchParams({
                    shippingFulfilled: false,
                    dwfrm_singleshipping_shipToUpsStore: false,
                    dwfrm_singleshipping_upsStoreData: null,
                    dwfrm_singleshipping_shippingAddress_addressFields_addressid: '',
                    dwfrm_singleshipping_shippingAddress_addressFields_firstName: this.profile.shipping_last_name,
                    dwfrm_singleshipping_shippingAddress_addressFields_lastName: this.profile.shipping_first_name,
                    dwfrm_singleshipping_shippingAddress_addressFields_phone: this.profile.phone_number,
                    singleMultiAddress: 'on',
                    dwfrm_singleshipping_shippingAddress_addressFields_address1: this.profile.shipping_address_line_1,
                    dwfrm_singleshipping_shippingAddress_addressFields_address2: this.profile.shipping_address_line_2,
                    dwfrm_singleshipping_shippingAddress_addressFields_city: this.profile.shipping_city,
                    dwfrm_singleshipping_shippingAddress_addressFields_states_state: this.profile.shipping_state.value,
                    dwfrm_singleshipping_shippingAddress_addressFields_postal: this.profile.shipping_zip_code,
                    dwfrm_singleshipping_shippingAddress_addressFields_country: this.profile.shipping_country.value,
                    dwfrm_singleshipping_shippingAddress_giftMessage: '',
                    dwfrm_singleshipping_shippingAddress_shippingMethodID: '2DAY-1',
                    donationProductVar: '',
                    dwfrm_donation_purchase_amount: '',
                    dwfrm_singleshipping_shippingAddress_save: 'Continue to Payment',
                    csrf_token: this.variables.dynamic.shipping_csrf_token
                })

                if (cancelled || !this.state.started || this.state.stopped) return;

                this.request({
                    url: `https://${this.variables.static.desktop_host}/checkoutshipping`,
                    method: 'POST',
                    headers: {
                        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                        'accept-encoding': 'gzip, deflate, br',
                        'accept-language': 'en-US,en;q=0.9',
                        'cache-control': 'no-cache',
                        'content-type': 'application/x-www-form-urlencoded',
                        'origin': `https://${this.variables.static.desktop_host}`,
                        'pragma': 'no-cache',
                        'referer': `https://${this.variables.static.desktop_host}/shipping`,
                        'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="96", "Google Chrome";v="96"',
                        'sec-ch-ua-mobile': '?0',
                        'sec-ch-ua-platform': '"Windows"',
                        'sec-fetch-dest': 'document',
                        'sec-fetch-mode': 'navigate',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-user': '?1',
                        'upgrade-insecure-requests': '1',
                        'user-agent': this.variables.static.user_agent
                    },
                    cookieJar: this.variables.static.cookieJar,
                    proxy: this.runArgs.proxy.current.parsed,
                    body: data.toString()
                }, async (err, res) => {
                    if (cancelled || !this.state.started || this.state.stopped) return;
                    try {
                        if (err) {
                            this.sendStatusMessage({id: this.id, msg: `Error Submitting Shipping Info (Request)`, status: "warning"});
                            return reject();
                        } else {
                            if (res.statusCode === 302 && res.headers['location'] === `https://${this.variables.static.desktop_host}/billing`) {
                                return resolve()
                            } else if (res.statusCode === 403) {
                                this.sendStatusMessage({id: this.id, msg: 'Blocked By PerimeterX', status: 'warning'})
                                await this.requestNewProxy({id: this.id})
                                return reject()
                            } else {
                                this.sendStatusMessage({id: this.id, msg: `Error Submitting Shipping Info (Status ${res.statusCode})`, status: "warning"});
                                return reject();
                            }
                        }
                    } catch (err) {
                        this.sendStatusMessage({id: this.id, msg: `Error Submitting Shipping Info (Catch Request)`, status: "warning"});
                        return reject();
                    }
                })
            } catch (err) {
                this.sendStatusMessage({id: this.id, msg: `Error Submitting Shipping Info (Catch Full)`, status: "warning"});
                return reject();
            }
        })
    }

    desktopInitializeBilling() {
        return new Promise(async (resolve, reject, onCancel) => {
            let cancelled = false;
            onCancel(() => { cancelled = true; });
            try {
                this.sendStatusMessage({id: this.id, msg: `Initializing Billing`, status: "status"})

                if (cancelled || !this.state.started || this.state.stopped) return;

                this.request({
                    url: `https://${this.variables.static.desktop_host}/billing`,
                    method: 'GET',
                    headers: {
                        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                        'accept-encoding': 'gzip, deflate, br',
                        'accept-language': 'en-US,en;q=0.9',
                        'cache-control': 'no-cache',
                        'origin': `https://${this.variables.static.desktop_host}`,
                        'pragma': 'no-cache',
                        'referer': `https://${this.variables.static.desktop_host}/shipping`,
                        'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="96", "Google Chrome";v="96"',
                        'sec-ch-ua-mobile': '?0',
                        'sec-ch-ua-platform': '"Windows"',
                        'sec-fetch-dest': 'document',
                        'sec-fetch-mode': 'navigate',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-user': '?1',
                        'upgrade-insecure-requests': '1',
                        'user-agent': this.variables.static.user_agent
                    },
                    cookieJar: this.variables.static.cookieJar,
                    proxy: this.runArgs.proxy.current.parsed
                }, async (err, res) => {
                    if (cancelled || !this.state.started || this.state.stopped) return;
                    try {
                        if (err) {
                            this.sendStatusMessage({id: this.id, msg: `Error Initializing Billing (Request)`, status: "warning"});
                            return reject();
                        } else {
                            if (res.statusCode === 200) {
                                this.variables.dynamic.billing_csrf_token = /(name="csrf_token")(.*?)(value=")(.*?)(")/.exec(res.body)[4]
                                return resolve()
                            } else if (res.statusCode === 403) {
                                this.sendStatusMessage({id: this.id, msg: 'Blocked By PerimeterX', status: 'warning'})
                                await this.requestNewProxy({id: this.id})
                                return reject()
                            } else {
                                this.sendStatusMessage({id: this.id, msg: `Error Initializing Billing (Status ${res.statusCode})`, status: "warning"});
                                return reject();
                            }
                        }
                    } catch (err) {
                        this.sendStatusMessage({id: this.id, msg: `Error Initializing Billing (Catch Request)`, status: "warning"});
                        return reject();
                    }
                })
            } catch (err) {
                this.sendStatusMessage({id: this.id, msg: `Error Initializing Billing (Catch Full)`, status: "warning"});
                return reject();
            }
        })
    }

    desktopSubmitBillingInfo() {
        return new Promise(async (resolve, reject, onCancel) => {
            let cancelled = false;
            onCancel(() => { cancelled = true; });
            try {
                this.sendStatusMessage({id: this.id, msg: `Submitting Billing Info`, status: "status"})

                const generationTime = new Date().toISOString()

                const encryptedCardNumber = this.variables.static.adyen.encrypt({
                    number: this.profile.card_number.match(/.{1,4}/g).join(' '),
                    generationtime: generationTime,
                })

                const encryptedCardExpiryMonth = this.variables.static.adyen.encrypt({
                    expiryMonth: this.profile.card_expiry_month.value,
                    generationtime: generationTime,
                })

                const encryptedCardExpiryYear = this.variables.static.adyen.encrypt({
                    expiryYear: this.profile.card_expiry_year.value,
                    generationtime: generationTime,
                })

                const encryptedCardSecurityCode = this.variables.static.adyen.encrypt({
                    cvc: this.profile.card_security_code,
                    generationtime: generationTime,
                })

                const data = new URLSearchParams({
                    RDFUID: '',
                    isskipOrderreview: false,
                    dwfrm_billing_rdfvalue: '',
                    onlyGiftIteamInCart: false,
                    checkMultiShippingnoaddr: false,
                    onlyBopisProductInCart: false,
                    showBillform: true,
                    cntrySessionVal: this.profile.billing_country.value,
                    stateSessionVal: '',
                    updateYear: null,
                    dwfrm_billing_billingAddress_addressFields_addressid: '',
                    dwfrm_billing_billingAddress_addressFields_firstName: this.profile.billing_first_name,
                    dwfrm_billing_billingAddress_addressFields_lastName: this.profile.billing_last_name,
                    dwfrm_billing_billingAddress_addressFields_address1: this.profile.billing_address_line_1,
                    dwfrm_billing_billingAddress_addressFields_address2: this.profile.billing_address_line_2,
                    dwfrm_billing_billingAddress_addressFields_city: this.profile.billing_city,
                    dwfrm_billing_billingAddress_addressFields_states_state: this.profile.billing_state.value,
                    dwfrm_billing_billingAddress_addressFields_postal: this.profile.billing_zip_code,
                    dwfrm_billing_billingAddress_addressFields_country: this.profile.billing_country.value,
                    dwfrm_billing_billingAddress_addressFields_phone: this.profile.phone_number,
                    chkSameAsAddress: false,
                    chkUsrAuth: false,
                    cartHasShipToStoreShipment: false,
                    dwfrm_billing_billingAddress_email_emailAddress: this.loginArgs.username,
                    onlyVGCInCart: false,
                    dwfrm_billing_giftCertCode: '',
                    dwfrm_billing_giftCertPin: '',
                    dwfrm_billing_shippingBillingSame:  '',
                    dwfrm_billing_paymentMethods_selectedPaymentMethodID: 'CREDIT_CARD',
                    dwfrm_adyPaydata_issuer: '',
                    dwfrm_adyPaydata_gender: '',
                    dwfrm_adyPaydata_dateOfBirth: '',
                    dwfrm_adyPaydata_telephoneNumber: '',
                    dwfrm_adyPaydata_socialSecurityNumber: '',
                    dwfrm_adyPaydata_adyenFingerprint: true,
                    noPaymentNeeded: true,
                    dwfrm_adyPaydata_adyenStateData: '',
                    dwfrm_adyPaydata_paymentFromComponentStateData: '',
                    dwfrm_adyPaydata_merchantReference: '',
                    dwfrm_adyPaydata_orderToken: '',
                    dwfrm_billing_paymentMethods_creditCard_owner: this.profile.card_name,
                    dwfrm_billing_paymentMethods_creditCard_number: this.profile.card_number.replace(/.(?=.{4,}$)/g, '*'),
                    dwfrm_billing_paymentMethods_creditCard_type: this.profile.card_type.toLowerCase(),
                    dwfrm_billing_paymentMethods_creditCard_adyenEncryptedCardNumber: encryptedCardNumber,
                    dwfrm_billing_paymentMethods_creditCard_adyenEncryptedExpiryMonth: encryptedCardExpiryMonth,
                    dwfrm_billing_paymentMethods_creditCard_adyenEncryptedExpiryYear: encryptedCardExpiryYear,
                    dwfrm_billing_paymentMethods_creditCard_adyenEncryptedSecurityCode: encryptedCardSecurityCode,
                    dwfrm_billing_paymentMethods_creditCard_browserInfo: {
                        "acceptHeader": "*/*",
                        "colorDepth": 24,
                        "language": "en-US",
                        "javaEnabled": false,
                        "screenHeight": 1080,
                        "screenWidth": 1920,
                        "userAgent": this.variables.static.user_agent,
                        "timeZoneOffset": 300
                    },
                    dwfrm_billing_paymentMethods_creditCard_saveCard: false,
                    dwfrm_billing_paymentMethods_creditCard_selectedCardID: '',
                    dwfrm_billing_paymentMethods_bml_gender: '',
                    dwfrm_billing_paymentMethods_bml_year: '',
                    dwfrm_billing_paymentMethods_bml_month: '',
                    dwfrm_billing_paymentMethods_bml_day: '',
                    dwfrm_billing_save: 'Continue to Review',
                    csrf_token: this.variables.dynamic.billing_csrf_token
                })
                                
                if (cancelled || !this.state.started || this.state.stopped) return;

                this.request({
                    url: `https://${this.variables.static.desktop_host}/on/demandware.store/Sites-RalphLauren_US-Site/en_US/COBilling-Billing`,
                    method: 'POST',
                    headers: {
                        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                        'accept-encoding': 'gzip, deflate, br',
                        'accept-language': 'en-US,en;q=0.9',
                        'cache-control': 'no-cache',
                        'content-type': 'application/x-www-form-urlencoded',
                        'origin': `https://${this.variables.static.desktop_host}`,
                        'pragma': 'no-cache',
                        'referer': `https://${this.variables.static.desktop_host}/billing`,
                        'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="96", "Google Chrome";v="96"',
                        'sec-ch-ua-mobile': '?0',
                        'sec-ch-ua-platform': '"Windows"',
                        'sec-fetch-dest': 'document',
                        'sec-fetch-mode': 'navigate',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-user': '?1',
                        'upgrade-insecure-requests': '1',
                        'user-agent': this.variables.static.user_agent
                    },
                    cookieJar: this.variables.static.cookieJar,
                    proxy: this.runArgs.proxy.current.parsed,
                    body: data.toString()
                }, async (err, res) => {
                    if (cancelled || !this.state.started || this.state.stopped) return;
                    try {
                        if (err) {
                            this.sendStatusMessage({id: this.id, msg: `Error Submitting Billing Info (Request)`, status: "warning"});
                            return reject();
                        } else {
                            if (res.statusCode === 200) {
                                this.variables.dynamic.order_csrf_token = /(name="csrf_token")(.*?)(value=")(.*?)(")/.exec(res.body)[4]
                                return resolve()
                            } else if (res.statusCode === 403) {
                                this.sendStatusMessage({id: this.id, msg: 'Blocked By PerimeterX', status: 'warning'})
                                await this.requestNewProxy({id: this.id})
                                return reject()
                            } else {
                                this.sendStatusMessage({id: this.id, msg: `Error Submitting Billing Info (Status ${res.statusCode})`, status: "warning"});
                                return reject();
                            }
                        }
                    } catch (err) {
                        this.sendStatusMessage({id: this.id, msg: `Error Submitting Billing Info (Catch Request)`, status: "warning"});
                        return reject();
                    }
                })
            } catch (err) {
                this.sendStatusMessage({id: this.id, msg: `Error Submitting Billing Info (Catch Full)`, status: "warning"});
                return reject();
            }
        })
    }

    desktopSubmitOrder() {
        return new Promise(async (resolve, reject, onCancel) => {
            let cancelled = false;
            onCancel(() => { cancelled = true; });
            try {
                this.sendStatusMessage({id: this.id, msg: `Submitting Order`, status: "status"})

                const data = new URLSearchParams({
                    // fortertoken: 'ccc7bf9caba049c492672f9b79a695bd_1638628074625__UDF43_6_tt', // TODO: add forter device fingerprint generation and handling
                    RDFUID: '',
                    csrf_token: this.variables.dynamic.order_csrf_token
                })
                                
                if (cancelled || !this.state.started || this.state.stopped) return;

                this.request({
                    url: `https://${this.variables.static.desktop_host}/orderconfirmation`,
                    method: 'POST',
                    headers: {
                        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                        'accept-encoding': 'gzip, deflate, br',
                        'accept-language': 'en-US,en;q=0.9',
                        'cache-control': 'no-cache',
                        'content-type': 'application/x-www-form-urlencoded',
                        'origin': `https://${this.variables.static.desktop_host}`,
                        'pragma': 'no-cache',
                        'referer': `https://${this.variables.static.desktop_host}/on/demandware.store/Sites-RalphLauren_US-Site/en_US/COBilling-Billing`,
                        'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="96", "Google Chrome";v="96"',
                        'sec-ch-ua-mobile': '?0',
                        'sec-ch-ua-platform': '"Windows"',
                        'sec-fetch-dest': 'document',
                        'sec-fetch-mode': 'navigate',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-user': '?1',
                        'upgrade-insecure-requests': '1',
                        'user-agent': this.variables.static.user_agent
                    },
                    cookieJar: this.variables.static.cookieJar,
                    proxy: this.runArgs.proxy.current.parsed,
                    body: data.toString()
                }, async (err, res) => {
                    if (cancelled || !this.state.started || this.state.stopped) return;
                    try {
                        if (err) {
                            this.sendStatusMessage({id: this.id, msg: `Error Submitting Order (Request)`, status: "warning"});
                            return reject();
                        } else {
                            if (res.statusCode === 302) {
                                if (res.headers['location'] === 'https://www.ralphlauren.com/billing?applicableCardRefused=true') {
                                    this.sendStatusMessage({id: this.id, msg: 'Card Refused', status: 'warning'})
                                    return reject()
                                } else if (res.headers['location'] === 'https://www.ralphlauren.com/billing?adyenPaymentRefused=true') {
                                    this.sendStatusMessage({id: this.id, msg: 'Card Refused', status: 'warning'})
                                    return reject()
                                } else {
                                    console.log(JSON.stringify(res))
                                    this.sendStatusMessage({id: this.id, msg: 'Checked Out', status: 'success'})
                                    return resolve()
                                }
                            } else if (res.statusCode === 403) {
                                this.sendStatusMessage({id: this.id, msg: 'Blocked By PerimeterX', status: 'warning'})
                                await this.requestNewProxy({id: this.id})
                                return reject()
                            } else {
                                this.sendStatusMessage({id: this.id, msg: `Error Submitting Order (Status ${res.statusCode})`, status: "warning"});
                                return reject();
                            }
                        }
                    } catch (err) {
                        this.sendStatusMessage({id: this.id, msg: `Error Submitting Order (Catch Request)`, status: "warning"});
                        return reject();
                    }
                })
            } catch (err) {
                this.sendStatusMessage({id: this.id, msg: `Error Submitting Order (Catch Full)`, status: "warning"});
                return reject();
            }
        })
    }

    cardFlow() {
        const task = this;
        const desktopInitializeLoginWrapper = async () => {
            task.state.promises["desktopInitializeLogin"] = task.desktopInitializeLogin().then(async () => {
                await task.monitorDelay();
                const desktopLoginWrapper = async () => {
                    task.state.promises["desktopLogin"] = task.desktopLogin().then(async () => {
                        await task.monitorDelay();
                        const mobileSignInWrapper = async () => {
                            task.state.promises["mobileSignIn"] = task.mobileSignIn().then(async () => {
                                await task.monitorDelay();
                                const mobileAddToCartWrapper = async () => {
                                    task.state.promises["mobileAddToCart"] = task.mobileAddToCart().then(async () => {
                                        await task.monitorDelay();
                                        const desktopInitializeShippingWrapper = async () => {
                                            task.state.promises["desktopInitializeShipping"] = task.desktopInitializeShipping().then(async () => {
                                                await task.monitorDelay();
                                                const desktopSubmitShippingInfoWrapper = async () => {
                                                    task.state.promises["desktopSubmitShippingInfo"] = task.desktopSubmitShippingInfo().then(async () => {
                                                        await task.monitorDelay();
                                                        const desktopInitializeBillingWrapper = async () => {
                                                            task.state.promises["desktopInitializeBilling"] = task.desktopInitializeBilling().then(async () => {
                                                                await task.monitorDelay();
                                                                const desktopSubmitBillingInfoWrapper = async () => {
                                                                    task.state.promises["desktopSubmitBillingInfo"] = task.desktopSubmitBillingInfo().then(async () => {
                                                                        await task.monitorDelay();
                                                                        const desktopSubmitOrderWrapper = async () => {
                                                                            task.state.promises["desktopSubmitOrder"] = task.desktopSubmitOrder().then(async () => {
                                                                                await task.monitorDelay();
                                                                            }).catch((err) => { task.state.timeouts["desktopSubmitOrder"] = setTimeout(desktopSubmitOrderWrapper, task.runArgs.retry_delay); })
                                                                        }
                                                                        desktopSubmitOrderWrapper();        
                                                                    }).catch((err) => { task.state.timeouts["desktopSubmitBillingInfo"] = setTimeout(desktopSubmitBillingInfoWrapper, task.runArgs.retry_delay); })
                                                                }
                                                                desktopSubmitBillingInfoWrapper();
                                                            }).catch((err) => { task.state.timeouts["desktopInitializeBilling"] = setTimeout(desktopInitializeBillingWrapper, task.runArgs.retry_delay); })
                                                        }
                                                        desktopInitializeBillingWrapper();       
                                                    }).catch((err) => { task.state.timeouts["desktopSubmitShippingInfo"] = setTimeout(desktopSubmitShippingInfoWrapper, task.runArgs.retry_delay); })
                                                }
                                                desktopSubmitShippingInfoWrapper();
                                            }).catch((err) => { task.state.timeouts["desktopInitializeShipping"] = setTimeout(desktopInitializeShippingWrapper, task.runArgs.retry_delay); })
                                        }
                                        desktopInitializeShippingWrapper();
                                    }).catch((err) => { task.state.timeouts["mobileAddToCartWrapper"] = setTimeout(mobileAddToCartWrapper, task.runArgs.retry_delay); })
                                }
                                mobileAddToCartWrapper()
                            }).catch((err) => { task.state.timeouts["mobileSignIn"] = setTimeout(mobileSignInWrapper, task.runArgs.retry_delay); })
                        }
                        mobileSignInWrapper();            
                    }).catch((err) => { task.state.timeouts["desktopLogin"] = setTimeout(desktopLoginWrapper, task.runArgs.retry_delay); })
                }
                desktopLoginWrapper();        
            }).catch((err) => { task.state.timeouts["desktopInitializeLogin"] = setTimeout(desktopInitializeLoginWrapper, task.runArgs.retry_delay); })
        }
        desktopInitializeLoginWrapper();    
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
            console.error(err)
            return callback ? callback({success: false, err: 'Catch Full'}) : false;
        }
    }

}

module.exports = TEMPLATE;
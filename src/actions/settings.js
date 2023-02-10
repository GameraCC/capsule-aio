import { SETTINGS_WEBHOOK_UPDATE, SETTINGS_TWOCAPTCHA_UPDATE, SETTINGS_CAPMONSTER_UPDATE, SETTINGS_TWOCAPTCHA_STATUS_UPDATE, SETTINGS_CAPMONSTER_STATUS_UPDATE } from './types'

import axios from 'axios'

export const updateWebhook = webhook => ({
  type: SETTINGS_WEBHOOK_UPDATE,
  webhook,
})

export const updateTwocaptcha = twocaptcha => ({
    type: SETTINGS_TWOCAPTCHA_UPDATE,
    twocaptcha,
})
  
export const updateCapmonster = capmonster => ({
    type: SETTINGS_CAPMONSTER_UPDATE,
    capmonster,
})

const updateTwoCaptchaStatus = (status, statusType) => ({
    type: SETTINGS_TWOCAPTCHA_STATUS_UPDATE,
    status,
    statusType
})

const updateCapmonsterStatus = (status, statusType) => ({
    type: SETTINGS_CAPMONSTER_STATUS_UPDATE,
    status,
    statusType
})

const handleTwocaptchaResult = (request) => {
    return new Promise((resolve) => {
        request.then((res) => {
            const resJSON = res.data
            if (resJSON.status === 1) {
                return resolve({success: true, balance: resJSON.request})
            } else if (resJSON.status === 0) {
                if (resJSON.request === 'ERROR_WRONG_USER_KEY') {
                    return resolve({success: true, error: 'Invalid Key Format'})
                } else if (resJSON.request === 'ERROR_KEY_DOES_NOT_EXIST') {
                    return resolve({success: true, error: 'Key Does Not Exist'})
                } else if (resJSON.request === 'IP_BANNED') {
                    return resolve({success: true, error: 'Rate Limited'})
                } else {
                    return resolve({success: false})
                }
            } else {
                return resolve({success: false})
            }
        }).catch((error) => {
            return resolve({success: false, error})
        })    
    })
}


const handleCapmonsterResult = (request) => {
    return new Promise((resolve) => {
        request.then((res) => {
            const resJSON = res.data
            if (resJSON.errorId === 0) {
                return resolve({success: true, balance: resJSON.balance})
            } else if (resJSON.errorId === 1) {
                return resolve({success: false})
            } else return resolve({success: false})
        }).catch((error) => {
            console.error(error)
            return resolve({success: true, error: 'Key Does Not Exist'})
        })                
    })
}

const checkTwocaptchaBalance = (settings) => {
    try {
        if (!settings.twocaptcha) return

        return axios({
            url: `http://2captcha.com/res.php?key=${settings.twocaptcha}&action=getbalance&json=1&header_acao=1`,
            method: 'POST'
        })    
    } catch (err) {
        console.error(err)
        return
    }
}

const checkCapmonsterBalance = (settings) => {
    try {
        if (!settings.capmonster) return
    
        return axios({
            url: 'https://api.capmonster.cloud/getBalance',
            method: 'POST',
            data: {clientKey: settings.capmonster}
        })    
    } catch (err) {
        console.error(err)
        return
    }
}

export const handleCheckBalance = type => async (dispatch, getState) => {
    const { settings } = getState()

    let checkBalanceRequest, handleResult, sendStatusMessage

    switch (type) {
        case 'twocaptcha':
            checkBalanceRequest = checkTwocaptchaBalance
            handleResult = handleTwocaptchaResult
            sendStatusMessage = (status, type) => dispatch(updateTwoCaptchaStatus(status, type))
            break
        case 'capmonster':
            checkBalanceRequest = checkCapmonsterBalance
            handleResult = handleCapmonsterResult
            sendStatusMessage = (status, type) => dispatch(updateCapmonsterStatus(status, type))
            break
        default:
            break
    }

    try {
        sendStatusMessage('Checking Balance', 'status')

        const request = checkBalanceRequest(settings)
    
        if (request) {
            const result = await handleResult(request)
    
            if (result?.success) {
                if (result.error) sendStatusMessage(result.error, 'error')
                else sendStatusMessage(`Balance: $${result.balance}`, 'success')
            } else {
                if (result.error) console.error(result.error)
                sendStatusMessage('Error Checking Balance (Request Failure)', 'error')
            }
        } else sendStatusMessage('Error Checking Balance (No Request)', 'error')
    } catch (err) {
        console.error(err)
        sendStatusMessage('Error Checking Balance (Catch Full)', 'error')
    }
}

export const sendWebhook = () => (dispatch, getState) => {
  // console.log('sending request', username, content)

  const { settings } = getState()

  if (!settings.webhook) return
  try {
    new URL(settings.webhook)
  } catch {
    return
  }

  const webhookSettings = {
    colors: {
        success: '57FF9A',
        decline: 'FF5757',
    },
    footer: {
        icon_url: 'https://capsuleaio.com/logo512.png',
        text: 'Capsule AIO'
    }
  }

  const data = {
        embeds: [{
            title: `Test Webhook | ${webhookSettings.footer.text}`,
            description: '[Successful Webhook Test](https://capsuleaio.com)',
            color: parseInt(webhookSettings.colors.success, 16),
            timestamp: new Date().toISOString(),
            footer: webhookSettings.footer,
            thumbnail: {
                url: webhookSettings.footer.icon_url
            },
            fields: [
                {
                    name: 'Profile',
                    value: 'No Profile',
                    inline: true
                },
                {
                    name: 'Proxy List',
                    value: 'No Proxy',
                    inline: true
                },
                {
                    name: 'Size', 
                    value: 'None',
                    inline: true
                },
                {
                    name: 'Price',
                    value: `$0`,
                    inline: true
                },
                {
                    name: 'Email',
                    value: `||No Email||`,
                    inline: true
                },
                {
                    name: 'Order ID',
                    value: `||No Order ID||`,
                    inline: true
                }
            ]
        }]
    }

  axios
    .post(settings.webhook, data)
    .then(response => {
      console.log('response', response)
    })
    .catch(err => {
      console.error('err', err)
    })
}

const { v4: uuidv4 } = require('uuid')

let apiKey = ''
let request

function tokenRouter(action, params) {
  return new Promise((res, rej) => {
    const uid = uuidv4()

    const body = JSON.stringify({
      uid,
      action,
      ...params
    })

    request({
      method: 'post',
      url: 'https://api.capsuleaio.com/v1/token/',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body
    }, (err, data) => {
      if (err || data?.statusCode !== 200) rej(err || new Error(data.statusCode + ' response from server'))
      else {
        try {
          const { token } = JSON.parse(data.body)
          res(token)
        } catch (err) {
          rej(err)
        }
      }
    })
  })
}

module.exports = {
  setApiKey: key => {
    if (key && typeof key === 'string') apiKey = key
  },
  setRequest: Request => request = Request,
  getNokamai: params => tokenRouter('nok', params),
  getPixel: params => tokenRouter('pix', params),
  getInitialFingerprint: params => tokenRouter('init', params)
}

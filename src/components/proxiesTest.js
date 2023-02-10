import { Promise } from 'bluebird'

Promise.config({
  cancellation: true,
})

const request = window.api.request

export default ({ host, port, username, password }) =>
  new Promise((resolve, reject, onCancel) => {
    onCancel(() => resolve())

    const options = {
        url: 'https://httpbin.org/get',
        method: 'GET',
        proxy: (username && password)
          ? `http://${username}:${password}@${host}:${port}`
          : `http://${host}:${port}`,
      },
      ping = {
        startTime: new Date(),
      }

    request(options, (err, data) => {
      if (err || data?.statusCode !== 200) return reject(new Error())

      ping.endTime = new Date()

      resolve(ping.endTime - ping.startTime)
    })
  })

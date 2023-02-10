// const { app } = require('electron')
const fs = require('fs')

// const logPath = app.getPath('logs')
const logPath = process.env.CAPSULE_LOG_PATH
const logQueue = []

// Size interval to update logs at
const LOG_SIZE_INTERVAL = 100
// Time interval in ms to update logs at, if size interval has not been reached
const LOG_TIME_INTERVAL = 2500

module.exports = qqRequest => {
  /**
   * Updates the log file
   *
   * @function updateLog
   */
  const updateLog = () => {
      try {
        if (logQueue.length) {
            // Get current log entries
            fs.readFile(`${logPath}/task-logs.json`, (err, data) => {
              if (err) {
                if (err.code === 'ENOENT') {
                  // If the file has not been created, create initialize it with the logQueue
                  fs.writeFile(`${logPath}/task-logs.json`, JSON.stringify(logQueue), err => {
                    if (err) return
                    else logQueue.splice(0, logQueue.length) // Clear log queue
                  })
                } else return
              } else {
                // Add previous logs to beginning of the log queue
                logQueue.unshift(...JSON.parse(data.toString('utf-8')))
                // Update the log file
                fs.writeFile(`${logPath}/task-logs.json`, JSON.stringify(logQueue), err => {
                  if (err) return
                  else logQueue.splice(0, logQueue.length) // Clear log queue
                })
              }
            })
          } else return      
      } catch (err) {
          console.error(`Error Logging Request, Error: ${err}`)
          return
      }
  }

  // Set the time interval to update the log
  const updateLogInterval = setInterval(updateLog, LOG_TIME_INTERVAL)

  /**
   * Pushes a log into the queue, updates once size interval has been reached
   *
   * @function queueLog
   *
   * @param {Object} args - Arguments to queue a log
   * @param {string} args.id - Id of task to be logged
   * @param {number} args.timestamp - Unix timestmap to be logged
   * @param {string} args.err - Error to be logged
   * @param {Object} args.res - Response to be logged
   */
  const queueLog = ({ id, timestamp, err, res }) => {
    logQueue.push({ id, timestamp, err, res })
    if (logQueue.length === LOG_SIZE_INTERVAL) updateLog(), clearInterval(updateLogInterval), (updateLogInterval = setInterval(updateLog, LOG_TIME_INTERVAL))
  }

  /**
   * Wraps qqRequest to add logging based on a queue, which logs on a time and size interval
   *
   * @function request
   *
   * @param {Object} args - Arguments to send a request
   * @param {string} args.url - Url to request
   * @param {"GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "CONNECT" | "OPTIONS" | "TRACE" | "HEAD"} args.method - HTTP request method to be used
   * @param {Object} args.headers - HTTP headers to be used
   * @param {?string | Object} args.body - HTTP body to be sent
   * @param {?string} args.proxy - Proxy to be used
   * @param {string} args.lic - License to be used
   * @param {?string} args.id - Id of task to be logged
   * @param {Boolean} args.log - Flag to determine whether or not request and response should be logged
   */
  const request = ({ url, method, headers, body, proxy, lic, log, id }, callback) => {
    qqRequest({ url, method, headers, body, proxy, lic }, (err, res) => {
      log && queueLog({ id, timestamp: Date.now(), err, res })
      return callback(err, res)
    })
  }

  return request
}

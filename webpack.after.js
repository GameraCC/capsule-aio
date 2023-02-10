const child_process = require('child_process')
const getPort = require('get-port')
const websocket = require('ws')
const chalk = require('chalk')

const logging = {
    colors: {
        types: {
            REACT_STDOUT: '#bbadff',
            REACT_STDERR: '#ff6a63',
            ELECTRON_STDOUT: '#3fbbfe',
            ELECTRON_STDERR: '#ff6a63',    
        },
        default: '#dbd9db',
        data: '#dbd9db',
        time: '#53ff45',
        delimiter_open: '#ff9e00',
        delimiter_close: '#ff9e00'
    },
    delimiter: {
        open: '',
        close: ' | ',
    }
}

// const padToMaxTypeLength = (type) => {
//     const padding = Object.keys(logging.colors.types).sort((a, b) => b.length - a.length)[0].length - type.length
//     return padding > 0 ? type + ' '.repeat(padding) : type
// }

const log = (data, type) => {
    const color = logging.colors.types[type] ? logging.colors.types[type] : logging.colors.default

    data = data.toString().split('\n')
    
    data.splice(data.length - 1, 1)

    data.forEach(_data => {
        process.stdout.write(
            chalk.hex(logging.colors.delimiter_open)(logging.delimiter.open) +
            chalk.hex(logging.colors.time)(new Date().toISOString()) +
            chalk.hex(logging.colors.delimiter_close)(logging.delimiter.close) +
            chalk.hex(logging.colors.delimiter_open)(logging.delimiter.open) +
            // chalk.hex(color)(color === logging.colors.default ? 'UNKNOWN_PROCESS' : padToMaxTypeLength(type)) +
            chalk.hex(color)(color === logging.colors.default ? 'UNKNOWN_PROCESS' : type) +
            chalk.hex(logging.colors.delimiter_close)(logging.delimiter.close) +
            chalk.hex(logging.colors.data)(_data + '\n')
        )
    })
}

var electronProcess
var electronWs

module.exports = async (app, server, compiler) => {
  let electronStarted = false
  let emit = false

  const port = await getPort({ port: getPort.makeRange(5200, 5500) })
  const electronPort = await getPort({ port: getPort.makeRange(5501, 5800) })

  const reactProcess = child_process.spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['run', 'react-dev'], {
    env: {
      ...process.env,
      PORT: port.toString(),
      NODE_ENV: 'development',
      BROWSER: 'none',
    },
  })

  process.on('exit', () => {
    reactProcess && reactProcess.kill()
    electronProcess && electronProcess.kill()
    child_process.execSync(`npx kill-port ${port}`)
  })

  reactProcess.on('error', err => {
    console.error('[REACT] Error: ' + err.message)
    process.exit()
  })

  reactProcess.on('exit', () => {
    console.log('[REACT] Closed, terminating process...')
    process.exit()
  })

  reactProcess.stdout.on('data', data => {
    log(data.toString(), 'REACT_STDOUT')
    electronStarted || startElectron()
  })
  reactProcess.stderr.on('data', data => log(data.toString(), 'REACT_STDERR'))

  const connectToDevWs = () => {
    electronWs = new websocket(`ws://localhost:${electronPort}`)
    electronWs.on('error', err => setTimeout(connectToDevWs, 1000))
    // electronWs.on('open', () => console.log(`[Dev Websocket Connection Open] ws://localhost:${electronPort}`))
    electronWs.on('message', message => console.log('received: %s', message))
  }
  
  const restartProcessRunner = () => {
    // console.log('Sending restart child process signal.')
    electronWs.send('restartProcessRunner')
  }

  const startElectron = () => {
    electronStarted = true
    if (emit) {
      electronProcess = child_process.spawn(require('electron'), ['./build/main.js'], {
        env: {
          ...process.env,
          ELECTRON_START_URL: 'http://localhost:' + port,
          DEV_WEBSOCKET_PORT: electronPort,
        },
      })

      electronProcess.on('error', err => {
        console.error('[ELECTRON] Error: ' + err.message)
        process.exit()
      })

      electronProcess.on('exit', () => {
        console.log('[ELECTRON] Closed, terminating process...')
        process.exit()
      })

      electronProcess.stdout.on('data', data => log(data, 'ELECTRON_STDOUT'))
      electronProcess.stderr.on('data', data => log(data, 'ELECTRON_STDERR'))

      connectToDevWs()
    } else setTimeout(startElectron, 250)
  }

  compiler.hooks.afterEmit.tapAsync('RunElectron', async (params, callback) => {
    emit && electronStarted && restartProcessRunner()
    emit = true

    return callback()
  })
}

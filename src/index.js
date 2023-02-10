import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import * as serviceWorker from './serviceWorker'

import rootReducer from './reducers'
import { resetTasks, updateTaskStatus, clearTasks, clearGroups } from './actions/tasks'
import App from './components/app'

import './index.scss'
import 'react-input-checkbox/lib/react-input-checkbox.min.css'

const reduxStore = createStore(rootReducer, applyMiddleware(thunk))

ReactDOM.render(
  <Provider store={reduxStore}>
    <svg xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', visibility: 'hidden' }}>
      <defs>
        <linearGradient x2="1" y1="0.5" y2="0.5" id="header-icon-gradient">
          <stop className="header-icon-gradient__primary" offset="0" />
          <stop className="header-icon-gradient__secondary" offset="1" />
        </linearGradient>
      </defs>
    </svg>
    <App />
  </Provider>,
  document.getElementById('root'),
)

reduxStore.dispatch(resetTasks())

/**
 *
 * Initialize SendStatusMessage listener to receive status updates from renderer process
 * @param {*} event
 */
window.onmessage = event => {
  if (event.data === 'sendStatusMessagePort') {
    window.sendStatusMessagePort = event.ports[0]

    let statusUpdatesQueue = {}

    /**
     * Event to change status message of a task from ipcMain process to ipcRenderer's sendStatusMessage function
     *
     * @event ipcMain:send-status-message
     * @param {object} args - Arguments to change status message of a task,
     * @param {string} args.id - Id of the task
     * @param {string} args.msg - Message to be update to task's status
     * @param {'success' | 'error' | 'warning' | 'status' | 'waiting' | 'idle' } status - Type of status
     */
    window.sendStatusMessagePort.onmessage = async ({ data: { statusUpdates } }) => {
      // console.log('sendStatus from window:', { statusUpdates })

      statusUpdates.forEach(({ id, msg, status, taskUpdates }) => {
        statusUpdatesQueue[id] = { msg, status, taskUpdates }
      })
    }

    setInterval(() => {
      if (Object.keys(statusUpdatesQueue).length > 0) {
        const statusUpdates = Object.keys(statusUpdatesQueue).map(id => {
          const { msg, status, taskUpdates } = statusUpdatesQueue[id]

          return { id, ...(msg && {msg}), ...(status && {status}), ...(taskUpdates && {taskUpdates}) }
        })

        reduxStore.dispatch(updateTaskStatus({ statusUpdates }))
        statusUpdatesQueue = {}
      }
    }, 150)
  } else if (event.data === 'devPort') {
    const devPort = event.ports[0]

    devPort &&
    (devPort.onmessage = async ({ data: { action } }) => {

      switch (action) {
        case 'resetTasks':
          reduxStore.dispatch(resetTasks())
          break
        default:
          break
      }
    })
  }
}

serviceWorker.unregister()

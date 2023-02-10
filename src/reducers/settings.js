import { SETTINGS_WEBHOOK_UPDATE, SETTINGS_TWOCAPTCHA_UPDATE, SETTINGS_CAPMONSTER_UPDATE, SETTINGS_TWOCAPTCHA_STATUS_UPDATE, SETTINGS_CAPMONSTER_STATUS_UPDATE } from '../actions/types'

const store = window.store
const taskManager = window.taskManager

const initialState = {
  ...store.get('settings'),
}

export default (
  state = {
    ...initialState,
  },
  action,
) => {
    // console.log('action: ', action)
  switch (action.type) {
    case SETTINGS_WEBHOOK_UPDATE: {
        state = {
            ...state,
            webhook: action.webhook,
          }
    
          const tasks = store.get('tasks')
    
          // Change webhook in stored state
          tasks.groups.forEach(group => {
              group.tasks.forEach(task => {
                task.current.webhookArgs.url = action.webhook
              })
          })
    
          // Change webhook in all tasks
          taskManager.editAllTasks({editProps: {
              webhookArgs: {
                  url: action.webhook
              }
          }})
    
          // Update state
          store.set('tasks', tasks)
          store.set('settings', state)
          return state
    }
    case SETTINGS_TWOCAPTCHA_UPDATE: {
        state = {
            ...state,
            twocaptcha: action.twocaptcha,
        }

        const tasks = store.get('tasks')

        // Change 2captcha api key of tasks in stored state
        tasks.groups.forEach(group => {
            group.tasks.forEach(task => {
              task.current.runArgs.twocaptcha = {
                  api_key: action.twocaptcha
              }
            })
        })
  
        // Change 2captcha api key in all tasks
        taskManager.editAllTasks({editProps: {
            runArgs: {
                twocaptcha: {
                    api_key: action.twocaptcha
                }
            }
        }})
  
        // Update state
        store.set('tasks', tasks)  
        store.set('settings', state)
        return state
    }
    case SETTINGS_CAPMONSTER_UPDATE: {
        state = {
            ...state,
            capmonster: action.capmonster,
        }

        const tasks = store.get('tasks')

        // Change capmonster api key of tasks in stored state
        tasks.groups.forEach(group => {
            group.tasks.forEach(task => {
              task.current.runArgs.capmonster = {
                  api_key: action.capmonster
              }
            })
        })
  
        // Change capmonster api key in all tasks
        taskManager.editAllTasks({editProps: {
            runArgs: {
                capmonster: {
                    api_key: action.capmonster
                }
            }
        }})
  
        // Update state
        store.set('tasks', tasks)  

        store.set('settings', state)
        return state
    }
    case SETTINGS_TWOCAPTCHA_STATUS_UPDATE:
        console.log('update')
        state = {
            ...state,
            twocaptchaStatusMessage: action.status,
            twocaptchaStatusMessageType: action.statusType
        }
        store.set('settings', state)
        return state
    case SETTINGS_CAPMONSTER_STATUS_UPDATE:
        state = {
            ...state,
            capmonsterStatusMessage: action.status,
            capmonsterStatusMessageType: action.statusType
        }
        store.set('settings', state)
        return state
    default:
      return state
  }
}

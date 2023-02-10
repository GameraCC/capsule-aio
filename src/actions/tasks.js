import { TASKS_NEW_GROUP, TASKS_UPDATE_GROUP, TASKS_DELETE_GROUP, TASKS_NEW_TASKS, TASKS_UPDATE_TASKS, TASKS_DELETE_TASK, TASKS_STATUS_UPDATE, TASKS_CHECK, TASKS_CLEAR, GROUPS_CLEAR } from './types'
import { v4 as uuidv4 } from 'uuid'
import { tasksGroupSetActive } from './app'

const taskManager = window.taskManager

const newGroup = group => ({
  type: TASKS_NEW_GROUP,
  group,
})

const updateGroup = group => ({
  type: TASKS_UPDATE_GROUP,
  group,
})

const deleteGroup = groupId => ({
  type: TASKS_DELETE_GROUP,
  groupId,
})

const updateTasks = (groupId, tasks) => ({
  type: TASKS_UPDATE_TASKS,
  groupId,
  tasks,
})

const newTasks = (groupId, tasks) => ({
  type: TASKS_NEW_TASKS,
  groupId,
  tasks,
})

const taskDelete = taskId => ({
  type: TASKS_DELETE_TASK,
  taskId,
})

export const clearTasks = () => ({
  type: TASKS_CLEAR,
})

export const clearGroups = () => ({
    type: GROUPS_CLEAR
})

const checkTasks = (tasks, checkAll, uncheckAll) => ({
  type: TASKS_CHECK,
  tasks,
  checkAll,
  uncheckAll
})

const statusDispatch = ({ id, msg, status, taskUpdates, statusUpdates }) => ({
  type: TASKS_STATUS_UPDATE,
  id,
  msg,
  status,
  taskUpdates,
  statusUpdates,
})

export const saveNewTasksGroup = group => (dispatch, getState) => {
  if (group.group_name.trim().length === 0) throw new Error('Invalid group name.')

  const { tasks } = getState()

  if (tasks.groups.some(x => x.group_name.toLowerCase().trim() === group.group_name.toLowerCase().trim())) throw new Error(`Group ${group.group_name} already exists.`)

  const id = uuidv4()

  dispatch(newGroup({ ...group, id, tasks: [] }))
  dispatch(tasksGroupSetActive(id))
}

export const editTaskGroup = group => (dispatch, getState) => {
  const { tasks } = getState()

  if (!tasks.groups.some(x => x.id === group.id)) throw new Error(`Group ${group.id} doesn't exist.`)

  dispatch(updateGroup(group))
}

export const deleteTasksGroup = id => (dispatch, getState) => {
  const { tasks } = getState()

  if (!tasks.groups.some(group => group.id === id)) throw new Error(`Group ${id} doesn't exist.`)

  // Taskmanager code:
  // Stop all tasks from group, and delete task from worker thread
  tasks.groups.find(group => group.id === id).tasks.forEach(({id}) => {
      taskManager.stopTask({id}).catch(err => console.error(err))
      taskManager.deleteTask({id}).catch(err => console.error(err))
  })

  dispatch(deleteGroup(id))
  dispatch(tasksGroupSetActive(undefined))
}

export const resetTasks = () => async (dispatch, getState) => {
  const sites = await taskManager.getSites()
  const { tasks, settings: { webhook, twocaptcha, capmonster } } = getState()

  tasks.groups.forEach(group => {
    const taskCreationPromises = []
    if (typeof sites[group.site.value] == 'undefined') return

    group.tasks.forEach(task => {
      // Taskmanager code:
      // Stop task
      taskManager.stopTask({ id: task.id }).catch(err => console.error('Error stopping task:', err))

      const taskProps = {
        type: sites[group.site.value].type,
        id: task.id,
        group: { ...task.current.group },
        profile: { ...task.current.profile },
        runArgs: { ...task.current.runArgs, site: sites[group.site.value].type, twocaptcha: { enabled: task.current.runArgs?.twocaptcha?.enabled || false, api_key: twocaptcha }, capmonster: {enabled: task.current.runArgs?.capmonster?.enabled || false, api_key: capmonster} },
        productArgs: { ...task.current.productArgs },
        webhookArgs: { ...(task.current.webhookArgs || {}), url: webhook },
      }

      taskCreationPromises.push(
        new Promise(async (resolve, reject) => {
          taskManager.createTask(taskProps, res => {
            if (!res.success) {
              return reject(res.err)
            }

            task.current = {
              ...res.task,
            }

            task.checked = false

            return resolve()
          })
        }),
      )
    })

    Promise.all(taskCreationPromises)
      .then(() => {
        dispatch(updateTasks(group.id, group.tasks))
      })
      .catch(err => {
        console.error('Unable to create task', err)
      })
  })
}

export const saveNewTask = (groupId, task) => async (dispatch, getState) => {
  const {
    billing,
    tasks: { groups },
    settings: { webhook, twocaptcha, capmonster }
  } = getState()

  const sites = await taskManager.getSites()

  const billingProfiles = billing.profiles.filter(x => task.billing.map(y => y.value).includes(x.id))

  const group = groups.find(group => group.id === groupId)

  // Taskmanager code

  const taskCreationPromises = []
  const tasks = []

  let b = 0
  for (let i = 0; i < task.amount; i++) {
    try {
      const billingProfile = billingProfiles[b++]
      if (b >= billingProfiles.length) b = 0

      const taskId = uuidv4()

      const taskProps = {
        type: sites[group.site.value].type,
        id: taskId,
        group: {
          id: group.id,
          checkout_limit: group.checkout_limit,
          checkout_limit_count: group.checkout_limit_count,
        },
        profile: {
          ...billingProfile
        },
        runArgs: {
          proxy: {
            name: task.proxy.label,
            group: task.proxy.value,
          },
          twocaptcha: {
            enabled: task.automatedRecaptcha.value === 'twocaptcha',
            api_key: twocaptcha
          },
          capmonster: {
            enabled: task.automatedRecaptcha.value === 'capmonster',
              api_key: capmonster
          },
          site: sites[group.site.value].type,
          mode: task.mode.value,
          retry_delay: task.retry_delay,
          monitor_delay: task.monitor_delay,
        },
        productArgs: {
          size: task.size,
          pid: task.product,
          sku: task.product,
        },
        webhookArgs: {
          url: webhook
        },
      }

      taskCreationPromises.push(
        new Promise(async (resolve, reject) => {
          taskManager.createTask(taskProps, res => {
            if (!res.success) {
              return reject()
            }

            tasks.push({ ...task, id: taskId, checked: false, status: '', current: { ...res.task } })

            return resolve()
          })
        }),
      )
    } catch (err) {
      throw new Error(err.message)
    }
  }

  Promise.all(taskCreationPromises)
    .then(() => {
      dispatch(newTasks(groupId, tasks))
    })
    .catch(err => {
      throw new Error('Unable to create task', err)
    })
}

export const deleteTask = id => (dispatch, getState) => {
  const { tasks } = getState()

  if (!tasks.groups.some(group => group.tasks.map(task => task.id).includes(id))) throw new Error(`Task ${id} does not exist.`)

  // stop task
  taskManager.stopTask({ id }).catch(err => console.error(err))
  // delete task in worker thread
  taskManager.deleteTask({id}).catch(err => console.error(err))

  dispatch(taskDelete(id))
}

export const startTask = id => (dispatch, getState) => {
  const { tasks } = getState()

  if (tasks.groups.filter(group => group.tasks.map(task => task.id).includes(id)) === 0) throw new Error(`Task ${id} does not exist.`)

  taskManager.startTask({ id }).catch(err => {
    console.error(err)
  })
}

export const startAllTasks = groupId => (dispatch, getState) => {
  const { tasks } = getState()

  if (tasks.groups.filter(({ id }) => id === groupId).length === 0) throw new Error(`Group ${groupId} does not exist.`)

  tasks.groups
    .find(({ id }) => id === groupId)
    .tasks.forEach(({ id }) => {
      taskManager.startTask({ id }).catch(err => {
        console.error(err)
      })
    })
}

export const stopTask = id => (dispatch, getState) => {
  const { tasks } = getState()

  if (tasks.groups.filter(group => group.tasks.map(task => task.id).includes(id)) === 0) throw new Error(`Task ${id} does not exist.`)

  taskManager.stopTask({ id }).catch(err => {
    console.error(err)
  })
}

export const stopAllTasks = groupId => (dispatch, getState) => {
  const { tasks } = getState()

  if (tasks.groups.filter(({ id }) => id === groupId).length === 0) throw new Error(`Group ${groupId} does not exist.`)

  tasks.groups
    .find(({ id }) => id === groupId)
    .tasks.forEach(({ id }) => {
      taskManager.stopTask({ id }).catch(err => {
        console.error(err)
      })
    })
}

export const updateTaskStatus =
  ({ id, msg, status, taskUpdates, statusUpdates }) =>
  async (dispatch, getState) => {
    if (id) {
      const { tasks } = getState()

      if (!tasks.groups.some(group => group.tasks.map(task => task.id).includes(id))) console.error(`Task ${id} does not exist.`)
    }

    dispatch(statusDispatch({ id, msg, status, taskUpdates, statusUpdates }))
  }

export const toggleTaskChecks = arrTasks => dispatch => {
  if (arrTasks?.length <= 0) return

  dispatch(checkTasks(arrTasks))
}

export const checkAllTasks = arrTasks => dispatch => {
  if (arrTasks?.length <= 0) return

  dispatch(checkTasks(arrTasks, true))
}

export const uncheckAllTasks = arrTasks => dispatch => {
  if (arrTasks?.length <= 0) return

  dispatch(checkTasks(arrTasks, false, true))
}
import { TASKS_NEW_GROUP, TASKS_UPDATE_GROUP, TASKS_DELETE_GROUP, TASKS_NEW_TASKS, TASKS_UPDATE_TASKS, TASKS_DELETE_TASK, TASKS_CLEAR, TASKS_STATUS_UPDATE, TASKS_CHECK, GROUPS_CLEAR } from '../actions/types'

const store = window.store

const initialState = {
  ...store.get('tasks'),
}

const filterTaskStatus = state => ({ ...state, groups: state.groups.map(group => ({ ...group, tasks: group.tasks.map(task => ({ ...task, taskUpdates: undefined, status: undefined, msg: undefined })) })) })

export default (
  state = {
    ...initialState,
  },
  action,
) => {
  switch (action.type) {
    case TASKS_NEW_GROUP:
      state = {
        ...state,
        groups: [...state.groups, action.group],
      }
      store.set('tasks', filterTaskStatus(state))
      return state
    case TASKS_UPDATE_GROUP:
      state = {
        ...state,
        groups: state.groups.map(group => (group.id !== action.groupId ? group : { ...group, ...action.group, site: group.site })),
      }
      store.set('tasks', filterTaskStatus(state))
      return state
    case TASKS_DELETE_GROUP:
      state = {
        ...state,
        groups: state.groups.filter(group => group.id !== action.groupId),
      }
      store.set('tasks', filterTaskStatus(state))
      return state
    case TASKS_NEW_TASKS:
      state = {
        ...state,
        groups: state.groups.map(group => (group.id !== action.groupId ? group : { ...group, tasks: [...group.tasks, ...action.tasks] })),
      }
      store.set('tasks', filterTaskStatus(state))
      return state
    case TASKS_DELETE_TASK:
      state = {
        ...state,
        groups: state.groups.map(group => (group.tasks.map(({ id }) => id).includes(action.taskId) ? { ...group, tasks: group.tasks.filter(({ id }) => id !== action.taskId) } : group)),
      }
      store.set('tasks', filterTaskStatus(state))
      return state
    case TASKS_UPDATE_TASKS:
      state = {
        ...state,
        groups: state.groups.map(group => (group.id !== action.groupId ? group : { ...group, tasks: group.tasks.map(task => (action.tasks.map(({ id }) => id).includes(task.id) ? { ...task, ...action.tasks.find(({ id }) => id === task.id) } : task)) })),
      }
      store.set('tasks', filterTaskStatus(state))
      return state
    case TASKS_CLEAR:
      state = {
        ...state,
        groups: state.groups.map(group => ({ ...group, tasks: [] })),
      }
      store.set('tasks', filterTaskStatus(state)) // Filtering task statuses is trivial, but put for readability
      return state
    case GROUPS_CLEAR:
        state = {
            ...state,
            groups: []
        }
        store.set('tasks', filterTaskStatus(state)) // Filtering task statuses is trivial, but put for readability
        return state
    case TASKS_STATUS_UPDATE:
      if (Array.isArray(action.statusUpdates)) {
        state = {
          ...state,
          groups: state.groups.map(group =>
            group.tasks.some(task => action.statusUpdates.some(({ id }) => id === task.id))
              ? {
                ...group,
                tasks: group.tasks.map(task => {
                  const update = action.statusUpdates.find(({ id }) => id === task.id)
                  if (update) return { ...task, ...update, taskUpdates: { ...task.taskUpdates, ...update.taskUpdates } }
                  else return task
                }),
              }
              : group,
          ),
        }
      } else {
        state = {
          ...state,
          groups: state.groups.map(group => (group.tasks.some(task => task.id === action.id) ? { ...group, tasks: group.tasks.map(task => (task.id === action.id ? { ...task, ...action, taskUpdates: { ...task.taskUpdates, ...action.taskUpdates } } : task)) } : group)),
        }
      }
      return state
    case TASKS_CHECK:
      state = {
        ...state,
        groups: state.groups.map(group =>
          group.tasks.some(task => action.tasks.some(id => id === task.id)) ?
            {
              ...group,
              tasks: group.tasks.map(task =>
                action.tasks.find(id => id === task.id) ?
                  { ...task, checked: action.checkAll ? true : action.uncheckAll ? false : !task.checked } :
                  task
              )
            } : group)
      }
      return state
    default:
      return state
  }
}

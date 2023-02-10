import { BILLING_PROFILES_UPDATE, BILLING_NEW_PROFILE, BILLING_UPDATE_PROFILE, BILLING_DELETE_PROFILE } from '../actions/types'

const store = window.store
const taskManager = window.taskManager

let initialState = {
  ...store.get('billing'),
}

export default (
  state = {
    ...initialState,
  },
  action,
) => {
  switch (action.type) {
    case BILLING_PROFILES_UPDATE: {
      const { profiles } = store.get('billing')
      state = {
        ...state,
        profiles,
      }
      return state
    }
    case BILLING_NEW_PROFILE:
      state = {
        ...state,
        profiles: [...state.profiles, action.profile],
      }
      store.set('billing', state)
      return state
    case BILLING_UPDATE_PROFILE:
      state = {
        ...state,
        profiles: state.profiles.map(profile => (profile.id === action.profile.id ? { ...profile, ...action.profile } : profile)),
      }

      // Check if any tasks are using the given biling profile, and collect their ids to update their billing profile with the new billing profile
      const tasks = store.get('tasks')

      // Get ids of tasks using the billing profile being updated
      const ids = tasks.groups.reduce((acc, cur) => {
        if (cur.tasks?.length) {
            const ids = cur.tasks.reduce((_acc, task) => {
                task.current.profile.id === action.profile.id && _acc.push(task.current.id)

                // Update task state to new profile
                task.current.profile = action.profile
                return _acc
            }, [])
            acc.push(...ids)
        }
        return acc
      }, [])

      // Update tasks in worker threads, using the given profile, with the newly updated profile
      ids.forEach(id => window.taskManager.editTask({id, editProps: {
          profile: action.profile
      }}))


      // Update state
      store.set('tasks', tasks)
      store.set('billing', state)
      return state
    case BILLING_DELETE_PROFILE:
      state = {
        ...state,
        profiles: state.profiles.filter(profile => profile.id !== action.profileId),
      }
      store.set('billing', state)
      return state
    default:
      return state
  }
}

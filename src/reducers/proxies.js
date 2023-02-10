import { PROXIES_NEW_GROUP, PROXIES_DELETE_GROUP, PROXIES_CLEAR_GROUP, PROXIES_ADD_PROXIES, PROXIES_DELETE_PROXIES, PROXIES_TEST_UPDATE, PROXIES_TEST } from '../actions/types'

import { proxyComparer as comparer } from '../components/validation'

const store = window.store

const updateStore = proxies => store.set('proxies', { ...proxies, test: undefined, groups: proxies.groups.map(group => ({ ...group, proxies: group.proxies.map(({ host, port, username, password }) => ({ host, port, username, password })) })) })

let initialState = {
  ...store.get('proxies'),
}

export default (
  state = {
    ...initialState,
  },
  action,
) => {
  switch (action.type) {
    case PROXIES_NEW_GROUP:
      state = {
        ...state,
        groups: [...state.groups, action.group],
      }
      updateStore(state)
      return state
    case PROXIES_DELETE_GROUP:
      state = {
        ...state,
        groups: state.groups.filter(group => group.id !== action.groupId),
      }
      updateStore(state)
      return state
    case PROXIES_CLEAR_GROUP:
      state = {
        ...state,
        groups: state.groups.map(group => (group.id === action.groupId ? { ...group, proxies: [] } : group)),
      }
      updateStore(state)
      return state
    case PROXIES_ADD_PROXIES:
      state = {
        ...state,
        groups: state.groups.map(group => (group.id === action.groupId ? { ...group, proxies: [...group.proxies, ...action.proxies] } : group)),
      }
      updateStore(state)
      return state
    case PROXIES_DELETE_PROXIES:
      state = {
        ...state,
        groups: state.groups.map(group => (group.id === action.groupId ? { ...group, proxies: group.proxies.filter(proxy => !action.proxies.some(comparer(proxy))) } : group)),
      }
      updateStore(state)
      return state
    case PROXIES_TEST_UPDATE:
      state = {
        ...state,
        groups: state.groups.map(group => (group.id === action.groupId ? { ...group, proxies: group.proxies.map(proxy => action.proxies.some(comparer(proxy)) ? { ...proxy, ...action.proxies.find(comparer(proxy)) } : proxy) } : group)),
      }
      return state
    case PROXIES_TEST:
      state = {
        ...state,
        test: action.test,
      }
      return state
    default:
      return state
  }
}

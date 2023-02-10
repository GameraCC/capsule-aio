import { ACCOUNTS_UPDATE_STATE, ACCOUNTS_NEW_GROUP, ACCOUNTS_DELETE_GROUP, ACCOUNTS_ADD_ACCOUNTS, ACCOUNTS_DELETE_ACCOUNTS } from '../actions/types'
import { accountComparer as comparer } from '../components/validation'

const store = window.store

let initialState = {
  ...store.get('accounts'),
}

export default (
  state = {
    ...initialState,
  },
  action,
) => {
  switch (action.type) {
    case ACCOUNTS_UPDATE_STATE:
      state = {
        ...action.accounts,
        groups: [...action.accounts.groups],
      }
      return state
    case ACCOUNTS_NEW_GROUP:
      state = {
        ...state,
        groups: [...state.groups, action.group],
      }
      store.set('accounts', state)
      return state
    case ACCOUNTS_DELETE_GROUP:
      state = {
        ...state,
        groups: state.groups.filter(group => group.id !== action.groupId),
      }
      store.set('accounts', state)
      return state
    case ACCOUNTS_ADD_ACCOUNTS:
      state = {
        ...state,
        groups: state.groups.map(group => (group.id === action.groupId ? { ...group, accounts: [...group.accounts, ...action.accounts] } : group)),
      }
      store.set('accounts', state)
      return state
    case ACCOUNTS_DELETE_ACCOUNTS:
        try {
            state = {
                ...state,
                groups: state.groups.map(group => group.id === action.groupId ? { ...group, accounts: group.accounts.filter(account => !action.accounts.some(comparer(account)))} : group)
              }        
        } catch (err) {
            console.log(err)
        }
      store.set('accounts', state)
      return state
    default:
      return state
  }
}

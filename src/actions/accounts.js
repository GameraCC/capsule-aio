import { ACCOUNTS_UPDATE_STATE, ACCOUNTS_NEW_GROUP, ACCOUNTS_DELETE_GROUP, ACCOUNTS_ADD_ACCOUNTS, ACCOUNTS_DELETE_ACCOUNTS } from './types'
import { accountsGroupSetActive } from './app'
import { v4 as uuidv4 } from 'uuid'
import { accountPattern, accountComparer as comparer } from '../components/validation'

const store = window.store

export const updateAccountsState = accounts => ({
  type: ACCOUNTS_UPDATE_STATE,
  accounts,
})

const newGroup = group => ({
  type: ACCOUNTS_NEW_GROUP,
  group,
})

const deleteGroup = groupId => ({
  type: ACCOUNTS_DELETE_GROUP,
  groupId,
})

const newAccounts = (groupId, accounts) => ({
  type: ACCOUNTS_ADD_ACCOUNTS,
  groupId,
  accounts,
})

const delAccounts = (groupId, accounts) => ({
  type: ACCOUNTS_DELETE_ACCOUNTS,
  groupId,
  accounts,
})

export const saveNewAccountsGroup = group_name => (dispatch, getState) => {
  if (group_name.trim().length === 0) throw new Error('Invalid group name.')

  const { accounts } = getState()

  if (accounts.groups.some(group => group.group_name.toLowerCase().trim() === group_name.toLowerCase().trim())) throw new Error(`Group ${group_name} already exists.`)

  const id = uuidv4()

  dispatch(newGroup({ group_name, id, accounts: [] }))
  dispatch(accountsGroupSetActive(id))
}

export const deleteAccountsGroup = id => (dispatch, getState) => {
  const { accounts } = getState()

  if (!accounts.groups.some(group => group.id === id)) throw new Error('Account group does not exist.')

  dispatch(deleteGroup(id))
  dispatch(accountsGroupSetActive(undefined))
}

export const addAccounts = (id, accountsArr) => (dispatch, getState) => {
  const { accounts } = getState()

  console.log('accounts', accounts)

  const group = accounts.groups.find(group => group.id === id)
  if (!group) throw new Error(`Group ${id} doesn't exist.`)

  console.log('group', group)

  const regex = accountPattern

  let parsedAccounts = []
  let match

  while ((match = regex.exec(accountsArr))) {
    const { email, password } = match.groups

    if (!parsedAccounts.some(comparer({ email })) && !group.accounts.some(comparer({ email })))
      parsedAccounts.push({
        email,
        password,
      })
  }

  dispatch(newAccounts(id, parsedAccounts))
}

export const deleteAccounts = (id, accountsArr) => (dispatch, getState) => {
  const {
    accounts,
  } = getState()

  if (!accounts.groups.some(group => group.id === id)) throw new Error(`Group ${groupId} doesn't exist.`)

  dispatch(delAccounts(id, accountsArr))
}

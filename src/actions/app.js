import {
  CHANGE_ACTIVE_SCREEN,
  TASKS_GROUP_NEW_OPEN,
  TASKS_GROUP_NEW_CLOSE,
  TASKS_GROUP_NEW_CLEAR,
  TASKS_GROUP_NEW_SET,
  TASKS_GROUP_EDIT_OPEN,
  TASKS_GROUP_EDIT_CLOSE,
  TASKS_GROUP_EDIT_SET,
  TASKS_GROUP_SET_ACTIVE,
  TASKS_GROUP_DELETE_OPEN,
  TASKS_GROUP_DELETE_CLOSE,
  TASKS_CREATE_OPEN,
  TASKS_CREATE_CLOSE,
  TASKS_CREATE_SET,
  BILLING_PROFILE_OPEN,
  BILLING_PROFILE_CLOSE,
  BILLING_SET_PROFILE,
  BILLING_CLEAR_PROFILE,
  PROXIES_GROUP_SET_ACTIVE,
  PROXIES_GROUP_CREATE_OPEN,
  PROXIES_GROUP_CREATE_CLOSE,
  PROXIES_GROUP_DELETE_OPEN,
  PROXIES_GROUP_DELETE_CLOSE,
  PROXIES_ADD_OPEN, 
  PROXIES_ADD_CLOSE,
  ACCOUNTS_GROUP_SET_ACTIVE,
  ACCOUNTS_GROUP_CREATE_OPEN,
  ACCOUNTS_GROUP_CREATE_CLOSE,
  ACCOUNTS_GROUP_DELETE_OPEN,
  ACCOUNTS_GROUP_DELETE_CLOSE,
  ACCOUNTS_ADD_OPEN,
  ACCOUNTS_ADD_CLOSE,
  SHIPPING_RATES_GROUP_CREATE_OPEN,
  SHIPPING_RATES_GROUP_CREATE_CLOSE,
  SHIPPING_RATES_ADD_OPEN,
  SHIPPING_RATES_ADD_CLOSE
} from './types'

export const changeActiveScreen = screen => ({
  type: CHANGE_ACTIVE_SCREEN,
  screen,
})

export const tasksGroupNewOpen = () => ({
  type: TASKS_GROUP_NEW_OPEN
})

export const tasksGroupNewClose = () => ({
  type: TASKS_GROUP_NEW_CLOSE
})

export const tasksGroupNewClear = () => ({
  type: TASKS_GROUP_NEW_CLEAR
})

export const tasksGroupNewSet = group => ({
  type: TASKS_GROUP_NEW_SET,
  group
})

export const tasksGroupEditOpen = () => ({
  type: TASKS_GROUP_EDIT_OPEN
})

export const tasksGroupEditClose = () => ({
  type: TASKS_GROUP_EDIT_CLOSE
})

export const tasksGroupEditSet = group => ({
  type: TASKS_GROUP_EDIT_SET,
  group
})

export const tasksGroupSetActive = id => ({
  type: TASKS_GROUP_SET_ACTIVE,
  id
})

export const tasksGroupDeleteOpen = () => ({
  type: TASKS_GROUP_DELETE_OPEN
})

export const tasksGroupDeleteClose = () => ({
  type: TASKS_GROUP_DELETE_CLOSE
})


export const tasksCreateOpen = () => ({
  type: TASKS_CREATE_OPEN
})

export const tasksCreateClose = () => ({
  type: TASKS_CREATE_CLOSE
})

export const tasksCreateSet = task => ({
  type: TASKS_CREATE_SET,
  task
})

export const billingProfileEdit = profile_name => (dispatch, getState) => {
  const { billing } = getState()

  const profileIndex = billing.profiles.findIndex(
    x => x.profile_name.toLowerCase().trim() === profile_name.toLowerCase().trim(),
  )

  if (profileIndex >= 0){
    dispatch(billingProfileSet(billing.profiles[profileIndex]))
    dispatch(billingProfileOpen())
  }
}

export const billingProfileOpen = () => ({
  type: BILLING_PROFILE_OPEN,
})

export const billingProfileClose = () => ({
  type: BILLING_PROFILE_CLOSE,
})

export const billingProfileSet = profile => ({
  type: BILLING_SET_PROFILE,
  profile
})

export const billingProfileClear = () => ({
  type: BILLING_CLEAR_PROFILE,
})

export const proxiesGroupSetActive = id => ({
  type: PROXIES_GROUP_SET_ACTIVE,
  id,
})

export const proxiesGroupCreateOpen = () => ({
  type: PROXIES_GROUP_CREATE_OPEN,
})

export const proxiesGroupCreateClose = () => ({
  type: PROXIES_GROUP_CREATE_CLOSE,
})

export const proxiesGroupDeleteOpen = () => ({
  type: PROXIES_GROUP_DELETE_OPEN
})

export const proxiesGroupDeleteClose = () => ({
  type: PROXIES_GROUP_DELETE_CLOSE
})

export const proxiesAddOpen = () => ({
  type: PROXIES_ADD_OPEN,
})

export const proxiesAddClose = () => ({
  type: PROXIES_ADD_CLOSE,
})

export const accountsGroupSetActive = id => ({
  type: ACCOUNTS_GROUP_SET_ACTIVE,
  id
})

export const accountsGroupCreateOpen = () => ({
  type: ACCOUNTS_GROUP_CREATE_OPEN
})

export const accountsGroupCreateClose = () => ({
  type: ACCOUNTS_GROUP_CREATE_CLOSE
})

export const accountsGroupDeleteOpen = () => ({
  type: ACCOUNTS_GROUP_DELETE_OPEN
})

export const accountsGroupDeleteClose = () => ({
  type: ACCOUNTS_GROUP_DELETE_CLOSE
})

export const accountsAddOpen = () => ({
  type: ACCOUNTS_ADD_OPEN
})

export const accountsAddClose = () => ({
  type: ACCOUNTS_ADD_CLOSE
})

export const shippingRatesGroupCreateOpen = () => ({
  type: SHIPPING_RATES_GROUP_CREATE_OPEN
})

export const shippingRatesGroupCreateClose = () => ({
  type: SHIPPING_RATES_GROUP_CREATE_CLOSE
})

export const shippingRatesAddOpen = () => ({
  type: SHIPPING_RATES_ADD_OPEN
})

export const shippingRatesAddClose = () => ({
  type: SHIPPING_RATES_ADD_CLOSE
})

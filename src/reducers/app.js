import {
  CHANGE_ACTIVE_SCREEN,
  TASKS_GROUP_NEW_OPEN,
  TASKS_GROUP_NEW_CLOSE,
  TASKS_GROUP_NEW_SET,
  TASKS_GROUP_NEW_CLEAR,
  TASKS_GROUP_EDIT_OPEN,
  TASKS_GROUP_EDIT_CLOSE,
  TASKS_GROUP_EDIT_SET,
  TASKS_GROUP_SET_ACTIVE,
  TASKS_GROUP_DELETE_OPEN,
  TASKS_GROUP_DELETE_CLOSE,
  TASKS_CREATE_SET,
  TASKS_CREATE_OPEN,
  TASKS_CREATE_CLOSE,
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
  SHIPPING_RATES_ADD_CLOSE,
} from '../actions/types'
import proxies from './proxies'
import accounts from './accounts'

const initialBillingProfile = {
    profile_name: '',
    phone_number: '',
    email_address: '',
    card_name: '',
    card_type: '',
    card_number: '',
    card_expiry_month: '',
    card_expiry_year: '',
    card_security_code: '',
    billing_first_name: '',
    billing_last_name: '',
    billing_address_line_1: '',
    billing_address_line_2: '',
    billing_city: '',
    billing_state: '',
    billing_zip_code: '',
    billing_country: '',
    shipping_first_name: '',
    shipping_last_name: '',
    shipping_address_line_1: '',
    shipping_address_line_2: '',
    shipping_city: '',
    shipping_state: '',
    shipping_zip_code: '',
    shipping_country: '',
    single_checkout: false,
    same_shipping: false,
  },
  initialTasksGroup = {
    group_name: '',
    site: '',
    checkout_limit: false,
    checkout_limit_count: 0,
  },
  initialTask = {
    mode: '',
    amount: 1,
    product: '',
    proxy: '',
    billing: '',
    size: '',
    accounts: '',
    shipping_rate: '',
    monitor_delay: 3500,
    retry_delay: 3500,
    automatedRecaptcha: '',
    quantity: 1,
    task_scheduler: '',
    force_captcha: false,
  }

const initialState = {
  activeScreen: 'tasks',
  tasks: {
    activeGroup: undefined,
  },
  tasksGroupNew: {
    isOpen: false,
    group: {
      ...initialTasksGroup,
    },
  },
  tasksGroupEdit: {
    isOpen: false,
    group: {
      ...initialTasksGroup
    }
  },
  tasksGroupDelete: {
    isOpen: false
  },
  tasksCreate: {
    isOpen: false,
    task: {
      ...initialTask,
    },
  },
  billingProfile: {
    isOpen: false,
    profile: {
      ...initialBillingProfile,
    },
  },
  proxies: {
    activeGroup: undefined,
  },
  proxiesAdd: {
    isOpen: false,
  },
  proxiesGroupCreate: {
    isOpen: false,
  },
  proxiesGroupDelete: {
    isOpen: false,
  },
  accounts: {
    activeGroup: undefined,
  },
  accountsGroupCreate: {
    isOpen: false,
  },
  accountsGroupDelete: {
    isOpen: false,
  },
  accountsAdd: {
    isOpen: false,
  },
  shippingRatesGroupCreate: {
    isOpen: false,
  },
  shippingRatesAdd: {
    isOpen: false,
  },
}

const app = (state = initialState, action) => {
  switch (action.type) {
    case CHANGE_ACTIVE_SCREEN:
      state = { ...state, activeScreen: action.screen }
      return state
    case TASKS_GROUP_NEW_OPEN:
      state = { ...state, tasksGroupNew: { ...state.tasksGroupNew, isOpen: true } }
      return state
    case TASKS_GROUP_NEW_CLOSE:
      state = { ...state, tasksGroupNew: { ...state.tasksGroupNew, isOpen: false } }
      return state
    case TASKS_GROUP_NEW_SET:
      state = { ...state, tasksGroupNew: { ...state.tasksGroupNew, group: { ...action.group } } }
      return state
    case TASKS_GROUP_NEW_CLEAR:
      state = {
        ...state,
        tasksGroupNew: {
          ...state.tasksGroupNew,
          group: { ...initialTasksGroup },
        },
      }
      return state
    case TASKS_GROUP_SET_ACTIVE:
      state = { ...state, tasks: { ...state.tasks, activeGroup: action.id } }
      return state
    case TASKS_GROUP_EDIT_OPEN:
      state = { ...state, tasksGroupEdit: { ...state.tasksGroupEdit, isOpen: true }}
      return state
    case TASKS_GROUP_EDIT_CLOSE:
      state = { ...state, tasksGroupEdit: { ...state.tasksGroupEdit, isOpen: false }}
      return state
    case TASKS_GROUP_EDIT_SET:
      state = { ...state, tasksGroupEdit: { ...state.tasksGroupEdit, group: { ...action.group }}}
      return state
    case TASKS_GROUP_DELETE_OPEN:
      state = { ...state, tasksGroupDelete: { ...state.tasksGroupDelete, isOpen: true }}
      return state
    case TASKS_GROUP_DELETE_CLOSE:
      state = { ...state, tasksGroupDelete: { ...state.tasksGroupDelete, isOpen: false }}
      return state
    case TASKS_CREATE_OPEN:
      state = { ...state, tasksCreate: { ...state.tasksCreate, isOpen: true } }
      return state
    case TASKS_CREATE_CLOSE:
      state = { ...state, tasksCreate: { ...state.tasksCreate, isOpen: false } }
      return state
    case TASKS_CREATE_SET:
      state = {
        ...state,
        tasksCreate: {
          ...state.tasksCreate,
          task: { ...action.task },
        },
      }
      return state
    case BILLING_PROFILE_OPEN:
      state = { ...state, billingProfile: { ...state.billingProfile, isOpen: true } }
      return state
    case BILLING_PROFILE_CLOSE:
      state = { ...state, billingProfile: { ...state.billingProfile, isOpen: false } }
      return state
    case BILLING_SET_PROFILE:
      state = {
        ...state,
        billingProfile: {
          ...state.billingProfile,
          profile: { ...action.profile },
        },
      }
      return state
    case BILLING_CLEAR_PROFILE:
      state = {
        ...state,
        billingProfile: {
          ...state.billingProfile,
          profile: { ...initialBillingProfile },
        },
      }
      return state
    case PROXIES_GROUP_SET_ACTIVE:
      state = { ...state, proxies: { ...proxies, activeGroup: action.id } }
      return state
    case PROXIES_GROUP_CREATE_OPEN:
      state = { ...state, proxiesGroupCreate: { ...state.proxiesGroupCreate, isOpen: true } }
      return state
    case PROXIES_GROUP_CREATE_CLOSE:
      state = { ...state, proxiesGroupCreate: { ...state.proxiesGroupCreate, isOpen: false } }
      return state
    case PROXIES_GROUP_DELETE_OPEN:
      state = { ...state, proxiesGroupDelete: { ...state.proxiesGroupDelete, isOpen: true } }
      return state
    case PROXIES_GROUP_DELETE_CLOSE:
      state = { ...state, proxiesGroupDelete: { ...state.proxiesGroupDelete, isOpen: false } }
      return state
    case PROXIES_ADD_OPEN:
      state = { ...state, proxiesAdd: { ...state.proxiesAdd, isOpen: true } }
      return state
    case PROXIES_ADD_CLOSE:
      state = { ...state, proxiesAdd: { ...state.proxiesAdd, isOpen: false } }
      return state
    case ACCOUNTS_GROUP_SET_ACTIVE:
      state = { ...state, accounts: { ...accounts, activeGroup: action.id } }
      return state
    case ACCOUNTS_GROUP_CREATE_OPEN:
      state = { ...state, accountsGroupCreate: { ...state.accountsGroupCreate, isOpen: true } }
      return state
    case ACCOUNTS_GROUP_CREATE_CLOSE:
      state = { ...state, accountsGroupCreate: { ...state.accountsGroupCreate, isOpen: false } }
      return state
    case ACCOUNTS_GROUP_DELETE_OPEN:
      state = { ...state, accountsGroupDelete: { ...state.accountsGroupDelete, isOpen: true } }
      return state
    case ACCOUNTS_GROUP_DELETE_CLOSE:
      state = { ...state, accountsGroupDelete: { ...state.accountsGroupDelete, isOpen: false } }
      return state
    case ACCOUNTS_ADD_OPEN:
      state = { ...state, accountsAdd: { ...state.accountsAdd, isOpen: true } }
      return state
    case ACCOUNTS_ADD_CLOSE:
      state = { ...state, accountsAdd: { ...state.accountsAdd, isOpen: false } }
      return state
    case SHIPPING_RATES_GROUP_CREATE_OPEN:
      state = {
        ...state,
        shippingRatesGroupCreate: { ...state.shippingRatesGroupCreate, isOpen: true },
      }
      return state
    case SHIPPING_RATES_GROUP_CREATE_CLOSE:
      state = {
        ...state,
        shippingRatesGroupCreate: { ...state.shippingRatesGroupCreate, isOpen: false },
      }
      return state
    case SHIPPING_RATES_ADD_OPEN:
      state = {
        ...state,
        shippingRatesAdd: { ...state.shippingRatesAdd, isOpen: true },
      }
      return state
    case SHIPPING_RATES_ADD_CLOSE:
      state = {
        ...state,
        shippingRatesAdd: { ...state.shippingRatesAdd, isOpen: false },
      }
      return state
    default:
      return state
  }
}

export default app

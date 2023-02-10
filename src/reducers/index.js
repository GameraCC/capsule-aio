import { combineReducers } from 'redux'
import app from './app'
import tasks from './tasks'
import billing from './billing'
import proxies from './proxies'
import accounts from './accounts'
import shippingRates from './shippingRates'
import settings from './settings'
import bind from './bind'

export default combineReducers({
  app,
  tasks,
  billing,
  proxies,
  accounts,
  shippingRates,
  settings,
  bind
})

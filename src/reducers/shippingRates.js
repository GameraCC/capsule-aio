import { SHIPPING_RATES_UPDATE_STATE } from '../actions/types'

const store = window.store.get('shippingRates')

let initialState = {
  ...store
}

export default (
  state = {
    ...initialState
  },
  action,
) => {
  switch (action.type) {
    case SHIPPING_RATES_UPDATE_STATE:
      state = {
        ...action.shippingRates,
        groups: [...action.shippingRates.groups]
      }
      return state
    default:
      return state
  }
}
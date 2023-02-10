import { connect } from 'react-redux'

import Billing from '../components/billing'

import {
  billingProfileClose,
  billingProfileSet,
  billingProfileEdit,
  billingProfileOpen,
  billingProfileClear,
} from '../actions/app'
import { saveBillingProfile, billingProfileDelete, updateBillingProfiles } from '../actions/billing'

const mapStateToProps = ({ app: { activeScreen, billingProfile }, billing: { profiles } }) => ({
  activeScreen,
  profiles,
  billingProfile,
})

const mapDispatchToProps = dispatch => ({
  billingProfilesUpdate: () => dispatch(updateBillingProfiles()),
  billingProfile: {
    open: () => dispatch(billingProfileOpen()),
    close: () => dispatch(billingProfileClose()),
    submit: profile => dispatch(saveBillingProfile(profile)),
    set: (key, value) => dispatch(billingProfileSet(key, value)),
    clear: () => dispatch(billingProfileClear()),
    edit: profile_name => dispatch(billingProfileEdit(profile_name)),
    delete: id => dispatch(billingProfileDelete(id)),
  },
})

const mergeProps = (propsFromState, propsFromDispatch, ownProps) => ({
  ...propsFromState,
  ...propsFromDispatch,
  ...ownProps,
  billingProfile: {
    ...propsFromDispatch.billingProfile,
    ...propsFromState.billingProfile,
  },
})

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(Billing)

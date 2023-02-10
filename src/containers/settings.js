import { connect } from 'react-redux'

import Settings from '../components/settings'

import {
  updateWebhook,
  updateTwocaptcha,
  updateCapmonster,
  sendWebhook,
  handleCheckBalance
} from '../actions/settings'

const mapStateToProps = ({ app: { activeScreen }, settings, bind: { license } }) => ({ activeScreen, settings, license })

const mapDispatchToProps = dispatch => ({
  // changeActiveScreen: screen => dispatch(changeActiveScreen(screen)),
  updateWebhook: webhook => dispatch(updateWebhook(webhook)),
  updateTwocaptcha: twocaptcha => dispatch(updateTwocaptcha(twocaptcha)),
  updateCapmonster: capmonster => dispatch(updateCapmonster(capmonster)),
  sendWebhook: params => dispatch(sendWebhook(params)),
  handleCheckBalance: params => dispatch(handleCheckBalance(params))
})

export default connect(mapStateToProps, mapDispatchToProps)(Settings)

import { connect } from 'react-redux'

import Analytics from '../components/analytics'

const mapStateToProps = ({ app: { activeScreen } }) => ({ activeScreen })

const mapDispatchToProps = dispatch => ({
  // changeActiveScreen: screen => dispatch(changeActiveScreen(screen)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Analytics)

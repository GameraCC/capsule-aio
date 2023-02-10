import { connect } from 'react-redux'
import { changeActiveScreen } from '../actions/app'

import Menu from '../components/menu'

const mapStateToProps = ({
  app: {
    activeScreen,
  }
}) => ({ activeScreen })

const mapDispatchToProps = dispatch => ({
  changeActiveScreen: screen => dispatch(changeActiveScreen(screen)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Menu)

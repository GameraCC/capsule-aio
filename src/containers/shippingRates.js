import { connect } from 'react-redux'

import ShippingRates from '../components/shippingRates'

import { shippingRatesGroupCreateOpen, shippingRatesAddOpen } from '../actions/app'

const mapStateToProps = ({ app: { activeScreen }, shippingRates }) => ({ activeScreen, shippingRates })

const mapDispatchToProps = dispatch => ({
  groupCreateOpen: () => dispatch(shippingRatesGroupCreateOpen()),
  shippingRatesAddOpen: () => dispatch(shippingRatesAddOpen())
})

export default connect(mapStateToProps, mapDispatchToProps)(ShippingRates)

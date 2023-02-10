import React, { useEffect } from 'react'

import './app.scss'
import Menu from '../containers/menu'
import Controls from './windowControls'
import Analytics from '../containers/analytics'
import Tasks from '../containers/tasks'
import Billing from '../containers/billing'
import Proxies from '../containers/proxies'
import Accounts from '../containers/accounts'
import ShippingRates from '../containers/shippingRates'
import Settings from '../containers/settings'

import logo from '../img/logo.svg'

export default () => {
  useEffect(() => {
    window.onmessage = async event => {
      console.log('event!', event)
    }
  }, [])

  return (
    <>
      <header>
        <Controls />
      </header>
      <div id="app">
        <div id="navigation">
          <div className="logo">
            <img src={logo} alt="" />
          </div>

          <Menu />
        </div>

        <div id="screen">
          {/* <Analytics /> */}
          <Tasks />
          <Billing />
          <Proxies />
          <Accounts />
          {/* <ShippingRates /> */}
          <Settings />
        </div>
      </div>
    </>
  )
}

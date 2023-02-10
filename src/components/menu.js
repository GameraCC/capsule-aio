import React from 'react'

import './menu.scss'

const { showSolver } = window.windowControls

const Menu = ({ activeScreen, changeActiveScreen }) => (
  <div id="Menu">
    <div className="wrapper">
      <Tasks active={activeScreen === 'tasks'} onClick={() => changeActiveScreen('tasks')} />
      <Billing active={activeScreen === 'billing'} onClick={() => changeActiveScreen('billing')} />
      <Proxies active={activeScreen === 'proxies'} onClick={() => changeActiveScreen('proxies')} />
      <Accounts
        active={activeScreen === 'accounts'}
        onClick={() => changeActiveScreen('accounts')}
      />
      {/* <ShippingRates
        active={activeScreen === 'shippingRates'}
        onClick={() => changeActiveScreen('shippingRates')}
      /> */}
      {/* <Analytics
        active={activeScreen === 'analytics'}
        onClick={() => changeActiveScreen('analytics')}
      /> */}
      <Settings
        active={activeScreen === 'settings'}
        onClick={() => changeActiveScreen('settings')}
      />
      <Captcha
        onClick={() => showSolver()} 
        />
    </div>
  </div>
)

export default Menu

const Analytics = ({ active, onClick }) => (
  <div className={active ? 'active' : undefined} onClick={onClick}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
      <g transform="translate(-254 -21)">
        <g transform="translate(254 21)">
          <circle className="circle" cx="30" cy="30" r="30" opacity="0.15" />
          <g transform="translate(10 10)">
            <g>
              <path
                className="main"
                d="M24.194,36h-.378a3.763,3.763,0,0,1-3.168-3.161L15.824,7.993,10.856,20.8A1.8,1.8,0,0,1,9.2,22H3.8a2.012,2.012,0,0,1,0-4H8.012L12.53,6.413a3.567,3.567,0,0,1,3.66-2.385,3.762,3.762,0,0,1,3.162,3.146L24.176,32l4.968-12.763A1.811,1.811,0,0,1,30.8,18h5.4a2.012,2.012,0,0,1,0,4H31.988L27.47,33.579A3.615,3.615,0,0,1,24.194,36Z"
                transform="translate(0 0)"
              />
            </g>
          </g>
        </g>
      </g>
    </svg>
  </div>
)

const Tasks = ({ active, onClick }) => (
  <div className={active ? 'active' : undefined} onClick={onClick}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
      <g transform="translate(-534 -21)">
        <circle
          className="circle"
          cx="30"
          cy="30"
          r="30"
          transform="translate(534 21)"
          opacity="0.15"
        />
        <g transform="translate(544.136 31)">
          <rect
            className="accent"
            width="6.667"
            height="11.667"
            transform="translate(16.667 25.333)"
          />
          <path
            className="main"
            d="M32.033,15.631,19.183,2.5a1.667,1.667,0,0,0-2.367,0L3.967,15.647A3.333,3.333,0,0,0,3,18.031V32a3.333,3.333,0,0,0,3.15,3.333h5.183v-15A1.667,1.667,0,0,1,13,18.664H23a1.667,1.667,0,0,1,1.667,1.667v15H29.85A3.333,3.333,0,0,0,33,32V18.031a3.45,3.45,0,0,0-.967-2.4Z"
            transform="translate(2 1.336)"
          />
        </g>
      </g>
    </svg>
  </div>
)

const Billing = ({ active, onClick }) => (
  <div className={active ? 'active' : undefined} onClick={onClick}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
      <g transform="translate(-805 -21)">
        <circle
          className="circle"
          cx="30"
          cy="30"
          r="30"
          transform="translate(805 21)"
          fill="#4349a8"
          opacity="0.15"
        />
        <g transform="translate(813.977 30)">
          <path
            className="main"
            d="M32.033,5H7.3A5.365,5.365,0,0,0,2,10.429V24.9a5.365,5.365,0,0,0,5.3,5.429H32.033a5.365,5.365,0,0,0,5.3-5.429V10.429A5.365,5.365,0,0,0,32.033,5ZM17.9,23.1H10.833a1.81,1.81,0,0,1,0-3.619H17.9a1.81,1.81,0,0,1,0,3.619Zm10.6,0H24.967a1.81,1.81,0,0,1,0-3.619H28.5a1.81,1.81,0,0,1,0,3.619Zm5.3-10.857H5.533v-1.81A1.788,1.788,0,0,1,7.3,8.619H32.033a1.788,1.788,0,0,1,1.767,1.81Z"
            transform="translate(0.581 3.333)"
          />
        </g>
      </g>
    </svg>
  </div>
)

const Proxies = ({ active, onClick }) => (
  <div className={active ? 'active' : undefined} onClick={onClick}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
      <g transform="translate(-1076 -21)">
        <circle
          className="circle"
          cx="30"
          cy="30"
          r="30"
          transform="translate(1076 21)"
          fill="#4349a8"
          opacity="0.15"
        />
        <g transform="translate(1085.701 31)">
          <path
            className="main"
            d="M18.667,2A16.667,16.667,0,1,0,35.333,18.667,16.667,16.667,0,0,0,18.667,2Zm0,3.333a13.65,13.65,0,0,1,2.983.35,4.35,4.35,0,0,1-1.3,1.667c-.367.283-.767.517-1.167.767A7.6,7.6,0,0,0,16.1,10.9a10.817,10.817,0,0,0-1.033,5.5c0,2.267,0,3.6-1.583,4.783-2.283,1.783-5.767.783-7.933-.117a13.883,13.883,0,0,1-.217-2.4A13.333,13.333,0,0,1,18.667,5.333ZM26.817,29.2a11.317,11.317,0,0,0-1.05-1.9c-.183-.267-.367-.533-.533-.817-.65-1.133-.417-1.667.633-3.333l.167-.283A7.95,7.95,0,0,0,27,18.817a9.034,9.034,0,0,1,.15-1.667c.267-1.217,2.85-1.55,4.45-1.667a13.233,13.233,0,0,1-4.767,13.8Z"
            transform="translate(1.658 1.333)"
            fill="#4349a8"
          />
        </g>
      </g>
    </svg>
  </div>
)

const Accounts = ({ active, onClick }) => (
  <div className={active ? 'active' : undefined} onClick={onClick}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
      <g transform="translate(-1345 -21)">
        <circle
          className="circle"
          cx="30"
          cy="30"
          r="30"
          transform="translate(1345 21)"
          fill="#4349a8"
          opacity="0.15"
        />
        <g transform="translate(1356.393 31)">
          <path
            className="accent"
            d="M25.435,4.416a1.667,1.667,0,0,0-2.35.15L19.968,8.149l-1.05-1.183a1.671,1.671,0,0,0-2.5,2.217l2.317,2.6a1.66,1.66,0,0,0,2.483-.017l4.35-5a1.667,1.667,0,0,0-.133-2.35Z"
            transform="translate(9.821 2.668)"
            fill="#4349a8"
          />
          <path
            className="main"
            d="M12.667,16.333A6.667,6.667,0,1,0,6,9.667,6.667,6.667,0,0,0,12.667,16.333Z"
            transform="translate(3.156 2)"
            fill="#4349a8"
          />
          <path
            className="main"
            d="M24.667,26.333a1.667,1.667,0,0,0,1.667-1.667A11.667,11.667,0,0,0,3,24.667a1.667,1.667,0,0,0,1.667,1.667"
            transform="translate(1.156 8.667)"
            fill="#4349a8"
          />
        </g>
      </g>
    </svg>
  </div>
)

const ShippingRates = ({ active, onClick }) => (
  <div className={active ? 'active' : undefined} onClick={onClick}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
      <g>
        <circle className="circle" cx="30" cy="30" r="30" fill="#4349a8" opacity="0.15" />
        <path
          transform="translate(13,13)"
          className="main"
          d="M30.79,15.99l-6.56-5.27V7.13c0.07-1.5-1.08-2.77-2.58-2.85H5.4C3.91,4.37,2.78,5.64,2.85,7.13v14.25
			c-0.03,1.16,0.65,2.22,1.71,2.68c-0.89,2.19,0.15,4.68,2.34,5.58c2.19,0.89,4.68-0.15,5.58-2.34c0.4-0.98,0.42-2.07,0.07-3.06
			h9.07c-0.81,2.22,0.34,4.67,2.56,5.48s4.67-0.34,5.48-2.56c0.34-0.94,0.34-1.98,0-2.92h0.29c0.79,0,1.43-0.64,1.43-1.43v-5.7
			C31.35,16.67,31.14,16.26,30.79,15.99z M28.51,17.79v3.59h-4.28v-7.01L28.51,17.79z M9.98,25.66c0,0.79-0.64,1.43-1.43,1.43
			s-1.43-0.64-1.43-1.43s0.64-1.43,1.43-1.43S9.98,24.87,9.98,25.66z M17.1,21.38H5.7V7.13h15.68v14.25H17.1z M27.08,25.66
			c0,0.79-0.64,1.43-1.43,1.43s-1.43-0.64-1.43-1.43s0.64-1.43,1.43-1.43S27.08,24.87,27.08,25.66z"
        />
      </g>
    </svg>
  </div>
)

const Settings = ({ active, onClick }) => (
  <div className={active ? 'active' : undefined} onClick={onClick}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
      <g transform="translate(-1616 -21)">
        <circle
          className="circle"
          cx="30"
          cy="30"
          r="30"
          transform="translate(1616 21)"
          fill="#4349a8"
          opacity="0.15"
        />
        <g transform="translate(1625.902 31)">
          <circle
            className="accent"
            cx="2.5"
            cy="2.5"
            r="2.5"
            transform="translate(17.776 17.5)"
            fill="#4349a8"
          />
          <path
            className="main"
            d="M35.153,15.867l-1.317-4.2a3.767,3.767,0,0,0-4.8-2.517l-.567.183A2.9,2.9,0,0,1,25.82,8.9l-.183-.133a2.933,2.933,0,0,1-1.15-2.383V5.917a3.95,3.95,0,0,0-1.133-2.8A3.767,3.767,0,0,0,20.687,2h-4.25A3.867,3.867,0,0,0,12.62,5.883v.4A3.233,3.233,0,0,1,11.4,8.8l-.217.167A3.217,3.217,0,0,1,8.22,9.45a3.567,3.567,0,0,0-2.8.2,3.633,3.633,0,0,0-1.867,2.217L2.187,16.2a3.9,3.9,0,0,0,2.467,4.9H4.92a3.05,3.05,0,0,1,1.867,2.033l.1.267A3.433,3.433,0,0,1,6.5,26.5,3.95,3.95,0,0,0,7.32,32l3.45,2.617a3.75,3.75,0,0,0,2.25.717,3.333,3.333,0,0,0,.65,0,3.75,3.75,0,0,0,2.45-1.667l.383-.55a3,3,0,0,1,2.383-1.283,2.917,2.917,0,0,1,2.5,1.3l.2.283a3.733,3.733,0,0,0,5.367.883l3.383-2.533a3.967,3.967,0,0,0,.833-5.383l-.433-.633a3.333,3.333,0,0,1-.4-2.75,3.15,3.15,0,0,1,2.017-2.133l.333-.117a3.933,3.933,0,0,0,2.467-4.883ZM18.67,24.5A5.833,5.833,0,1,1,24.5,18.667,5.833,5.833,0,0,1,18.67,24.5Z"
            transform="translate(1.606 1.333)"
            fill="#4349a8"
          />
        </g>
      </g>
    </svg>
  </div>
)

const Captcha = ({ active, onClick }) => (
  <div onClick={onClick}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
      <g>
        <path
          className="main"
          d="M30.97,18.73c-0.94-0.29-1.94,0.23-2.24,1.16c-1.74,5.31-6.72,8.87-12.3,8.81
          C9.42,28.78,3.68,23.17,3.58,16.17C3.68,9.16,9.43,3.55,16.43,3.63c3.04-0.01,5.99,1.05,8.33,2.99l-3.89-0.64
          c-0.98-0.18-1.91,0.46-2.1,1.43c-0.18,0.98,0.46,1.91,1.43,2.1c0.03,0.01,0.06,0.01,0.09,0.01l7.59,1.25h0.3
          c0.21,0,0.41-0.04,0.61-0.11c0.07-0.02,0.13-0.06,0.18-0.11c0.13-0.05,0.25-0.11,0.36-0.2l0.16-0.2c0-0.09,0.16-0.16,0.23-0.27
          c0.07-0.11,0-0.18,0.09-0.25c0.05-0.1,0.09-0.21,0.12-0.32l1.34-7.16c0.19-0.99-0.46-1.94-1.45-2.13s-1.94,0.46-2.13,1.45
          l-0.48,2.6c-3-2.6-6.83-4.03-10.79-4.03C7.45-0.03,0.1,7.18,0,16.17c0.09,8.99,7.45,16.2,16.43,16.12
          c7.18,0.11,13.59-4.48,15.79-11.32c0.28-0.95-0.26-1.94-1.21-2.23C31,18.74,30.99,18.74,30.97,18.73L30.97,18.73z"
          transform="translate(14 14)"
          fill="#363b47"
        />
      </g>
    </svg>
  </div>
)

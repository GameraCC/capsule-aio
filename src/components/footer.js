import React from 'react'

import './footer.scss'

export default props => (
  <div id="footer">
    {
      {
        analytics: <Analytics {...props} />,
        tasks: <Tasks {...props} />,
        billing: <Billing {...props} />,
        proxies: <Proxies {...props} />,
        accounts: <Accounts {...props} />,
        settings: <Settings {...props} />,
      }[props.activeScreen]
    }
  </div>
)

const Analytics = () => (
  <>
    <div>
      <button>Screenshot</button>
      <button>Export</button>
    </div>
  </>
)

const Tasks = () => (
  <>
    <div>
      <button>Create</button>
      <button>Delete</button>
    </div>
    <div>
      <button>Play</button>
      <button>Pause</button>
    </div>
  </>
)

const Billing = ({ billingProfileOpen, billingClearProfile }) => (
  <>
    <div>
      <button
        onClick={e => {
          billingClearProfile()
          billingProfileOpen()
        }}>
        Create
      </button>
      <button>Delete</button>
    </div>
  </>
)

const Proxies = ({
  proxiesAddOpen,
  activeProxiesGroup,
  testProxies,
  cancelTestProxies,
  testStatus,
}) => {
  let testClick

  if (testStatus && testStatus.isPending())
    testClick = () => activeProxiesGroup && cancelTestProxies()
  else testClick = () => activeProxiesGroup && testProxies()

  return (
    <>
      <div>
        <button>Import</button>
        <button>Export</button>
      </div>
      <div>
        <button onClick={() => activeProxiesGroup && proxiesAddOpen()}>Add</button>
        <button>Delete</button>
      </div>
      <div>
        <button onClick={testClick}>
          {testStatus && testStatus.isPending() ? 'Cancel' : 'Test'}
        </button>
        <button>Clear</button>
      </div>
    </>
  )
}

const Accounts = () => (
  <>
    <div>
      <button>Import</button>
      <button>Export</button>
    </div>
    <div>
      <button>Add</button>
      <button>Delete</button>
    </div>
    <div>
      <button>Test</button>
      <button>Clear</button>
    </div>
  </>
)

const Settings = () => (
  <>
    <div>
      <button>Save</button>
      <button>Reset</button>
    </div>
  </>
)

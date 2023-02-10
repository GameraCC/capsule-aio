import React from 'react'

import './windowControls.scss'

const { minimize, close } = window.windowControls

export default () => (
  <>
    <header>
      <div className="window-controls">
        <div className="min" onClick={minimize}>
          _
        </div>
        <div className="exit" onClick={close}>
          X
        </div>
      </div>
    </header>
  </>
)

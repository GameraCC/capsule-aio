import React from 'react'

import './windowControls.scss'

const { minimize, quit } = window.windowControls

export default () => (
  <div className="window-controls">
    <div className="min" onClick={() => minimize()}>
      _
    </div>
    <div className="exit" onClick={() => quit()}>
      X
    </div>
  </div>
)

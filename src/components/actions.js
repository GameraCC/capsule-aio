import React from 'react'

import './actions.scss'

export const Play = props => (
  <div className="play" {...props}>
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 1 23 23">
      <path
        className="main"
        data-name="Path 32"
        d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm4,11.18-3.64,3.37A1.74,1.74,0,0,1,11.2,17a1.68,1.68,0,0,1-.69-.15,1.6,1.6,0,0,1-1-1.48V8.63a1.6,1.6,0,0,1,1-1.48,1.7,1.7,0,0,1,1.85.3L16,10.82a1.6,1.6,0,0,1,0,2.36Z"
      />
    </svg>
  </div>
)

export const Pause = props => (
  <div className="pause" {...props}>
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
      <g transform="translate(-0.016)">
        <path
          className="main"
          data-name="Path 33"
          d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2ZM10,15a1,1,0,0,1-2,0V9a1,1,0,0,1,2,0Zm6,0a1,1,0,0,1-2,0V9a1,1,0,0,1,2,0Z"
        />
      </g>
    </svg>
  </div>
)

export const Trash = props => (
  <div className="trash" {...props}>
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 -2 20 24">
      <g data-name="Group 17" transform="translate(-1763 -344.915)">
        <path
          className="main"
          data-name="Path 38"
          d="M170.35,48.7a10,10,0,1,0,10,10A10,10,0,0,0,170.35,48.7Zm4.084,8.185h-.454v4.991a1.361,1.361,0,0,1-1.361,1.362h-4.537a1.361,1.361,0,0,1-1.361-1.362V56.885h-.454a.454.454,0,1,1,0-.907h2.268V55.22a1.1,1.1,0,0,1,1.134-1.057h1.362a1.1,1.1,0,0,1,1.134,1.057v.757h2.268a.454.454,0,1,1,0,.907Z"
          transform="translate(1602.65 296.215)"
        />
      </g>
    </svg>
  </div>
)

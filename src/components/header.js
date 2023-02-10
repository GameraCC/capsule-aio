import React from 'react'
import key from 'weak-key'

import './header.scss'
import Select from './select'

export default ({ title }) => (
  <div className="empty-header">
    <div className="title">
      <span className="screen">{title.charAt(0).toUpperCase() + title.substr(1)}</span>
    </div>
    <div className="spacer" />
  </div>
)

export const SelectHeader = ({
  children,
  value,
  onChange,
  title,
  count,
  options,
  placeholder,
  buttons,
}) => (
  <div className="select-header">
    <div className="title">
      <span className="screen">{title.charAt(0).toUpperCase() + title.substr(1)}</span>
      <Count value={count} />
    </div>
    <div className="select">
      <Select
        placeholder={placeholder || 'Select'}
        onChange={onChange}
        value={value}
        options={options}
        selectHeader={true}
      />
      {buttons &&
        buttons.map(button => (
          <button key={key(button)} className={button.className} onClick={button.onClick} disabled={button.onClick ? false : true}>
            {button.name}
          </button>
        ))}
    </div>
    {children ? <div className="controls">{children}</div> : <div className="spacer" />}
  </div>
)

export const SearchHeader = ({ children, title, count, placeholder, buttons }) => (
  <div className="search-header">
    <div className="title">
      <span className="screen">{title.charAt(0).toUpperCase() + title.substr(1)}</span>
      <Count value={count} />
    </div>
    <div className="search">
      <input type="text" className="search" placeholder={placeholder || 'Search...'} />
      {buttons &&
        buttons.map(button => (
          <button key={key(button)} className={button.className} onClick={button.onClick} disabled={button.onClick ? false : true}>
            {button.name}
          </button>
        ))}
    </div>
    {children ? <div className="controls">{children}</div> : <div className="spacer" />}
  </div>
)

export const AnalyticsHeader = ({ title, options, placeholder }) => (
  <div className="analytics-header">
    <div className="title">
      <span className="screen">{title.charAt(0).toUpperCase() + title.substr(1)}</span>
    </div>
    <div className="select">
      <Select options={options} defaultValue={options[0]} analyticsHeader={true} />
    </div>
    <div className="spacer" />
  </div>
)

export const Count = ({ value }) =>
  value > 0 ? (
    <div className="count" style={value > 99 ? { fontSize: '20px' } : {}}>
      {value < 1000
        ? value
        : `${value.toString().substr(0, 1)}` +
          (value >= 10000
            ? `${value.toString().substr(1, 1)}k`
            : value.toString().substr(1, 1).startsWith('0')
            ? 'k'
            : `.${value.toString().substr(1, 1)}k`)}
    </div>
  ) : (
    <></>
  )

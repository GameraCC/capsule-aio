import React, { useState, useRef, useEffect } from 'react'
import './login.scss'
import logo from '../img/aioLogo.svg'
import { alphaNumDashRegex, alphaNum } from './validation'
import Controls from './windowControls'
import colors from './colors.module.scss'

let bind = window.store.get('bind')

export default () => {
  const [inputValue, setInputValue] = useState(typeof bind !== 'undefined' ? bind.license : ''),
    [statusMessage, setStatusMessage] = useState(''),
    [statusMessageType, setStatusMessageType] = useState('status')

  const inputValueRef = useRef()

  const onSubmit = e => {
    e.preventDefault()

    window.api.login(inputValue)
  }

  useEffect(() => {
    window.onmessage = async event => {
      if (event.source !== window) return

      switch (event.data.action) {
        case 'loginStatus':
          setStatusMessage(event.data.message)
          setStatusMessageType(event.data.status)
          break
        default:
          break
      }
    }
  }, [])

  return (
    <div id="loginWindow">
      <header>
        <Controls />
      </header>
      <form className="main" onSubmit={onSubmit}>
        <img src={logo} alt="Capsule AIO" />

        <input ref={inputValueRef} required type="text" pattern={alphaNumDashRegex} onInput={alphaNum} maxLength={32} value={inputValue} onChange={() => setInputValue(inputValueRef.current.value)} placeholder="License Key..." style={{ textAlign: 'center' }} />
        <input type="submit" value="Login" />
        <span style={{ height: '1em', fontSize: '1em', margin: '.25em', color: statusMessageType === 'error' ? colors.red : statusMessageType === 'success' ? colors.green : colors.white }}>{statusMessage}</span>
      </form>
    </div>
  )
}

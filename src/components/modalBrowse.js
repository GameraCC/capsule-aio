import React, { useState, useRef, useEffect } from 'react'

import './modal.scss'
import Modal from './modal'
import { alphaNumSpaceRegex, alphaNum } from './validation'

export default ({ isOpen, onRequestClose, onSubmit, message, confirm }) => {
  const [inputValue, setInputValue] = useState(''),
    inputValueRef = useRef()

  useEffect(() => {
    isOpen && setInputValue('')
  }, [isOpen])

  return (
    <Modal
      className="inputModal"
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      onAfterOpen={() => inputValueRef.current.focus()}>
      <form
        onSubmit={e => {
          e.preventDefault()

          try {
            onSubmit(inputValue)
          } catch (err) {
            inputValueRef.current.setCustomValidity(err.message)
            e.target.reportValidity()
          }
        }}>
        <span>{message}</span>
        <input
          ref={inputValueRef}
          required
          type="text"
          pattern={alphaNumSpaceRegex}
          onInput={alphaNum}
          maxLength={32}
          value={inputValue}
          onChange={() => setInputValue(inputValueRef.current.value)}
        />
        <input type="submit" value={confirm || 'Confirm'} />
      </form>
    </Modal>
  )
}

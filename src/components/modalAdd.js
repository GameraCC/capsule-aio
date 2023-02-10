import React, { useState, useRef, useEffect } from 'react'

import './modal.scss'
import Modal from './modal'

export default ({ isOpen, onRequestClose, onSubmit, message, confirm, placeholder }) => {
  const [inputValue, setInputValue] = useState(''),
    inputValueRef = useRef(0)

  useEffect(() => {
    isOpen && setInputValue('')
  }, [isOpen])

  return (
    <Modal
      className="addModal"
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
        <span>{message || 'Add Values'}</span>
        <textarea
          required
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          rows="20"
          placeholder={placeholder}
          ref={inputValueRef}
        />
        <input type="submit" value={confirm || 'Add'} />
      </form>
    </Modal>
  )
}

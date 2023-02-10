import React from 'react'

import './modal.scss'
import Modal from './modal'

export default ({ isOpen, onRequestClose, onSubmit, message, confirm }) => {
  
  return (
    <Modal
      className="confirmModal"
      isOpen={isOpen}
      onRequestClose={onRequestClose}>
      <form onSubmit={e => {
        e.preventDefault()

        try{
          onSubmit()
        } catch (err) {
          console.log(err)
        }
      }}>
        <span>{message || 'Are you sure?'}</span>
        
        <input type="submit" value={confirm || 'Confirm'} />
      </form>
    </Modal>
  )
}

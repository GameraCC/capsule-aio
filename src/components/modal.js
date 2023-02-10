import React from 'react'
import Modal from 'react-modal'

Modal.setAppElement('#root')

const styles = {
  overlay: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    padding: '80px',
    transition: 'opacity 80ms ease-in-out',
  },
  content: {
    flexShrink: 0,
    position: 'relative',
    top: 'unset',
    left: 'unset',
    right: 'unset',
    bottom: 'unset',
    backgroundColor: '#242B3B',
    borderRadius: '8px',
    border: 'none',
    padding: '10px',
    overflow: 'none',
    transition: 'transform 80ms ease-in-out',
  },
}

export default ({
  children,
  id,
  className,
  isOpen,
  onAfterOpen,
  onAfterClose,
  onRequestClose,
  contentLabel,
}) => (
  <Modal
    id={id}
    className={className}
    isOpen={isOpen}
    onAfterOpen={onAfterOpen}
    onAfterClose={onAfterClose}
    onRequestClose={onRequestClose}
    contentLabel={contentLabel}
    style={styles}
    closeTimeoutMS={80}>
    {children}
  </Modal>
)

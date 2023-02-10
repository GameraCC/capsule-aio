import React, { useRef, useEffect, useState } from 'react'

import './group.scss'
import './tasksGroup.scss'
import Modal from './modal'
import Select from './select'
import { Checkbox } from 'react-input-checkbox'
import { alphaNumSpaceRegex, alphaNum, numRegex, num } from './validation'

const taskManager = window.taskManager

export default ({ isOpen, close, group, set, submit, clear, title, button, disableSelect }) => {
  const groupNameRef = useRef()
  const [sites, setSites] = useState({})

  const sitesList = Object.values(sites).map((prop, i) => ({
    label: prop.label,
    value: Object.keys(sites)[i],
  }))

  useEffect(async () => {
    if (isOpen) {
      setSites(await taskManager.getSites())
    }
  }, [isOpen])

  const onSubmit = e => {
    e.preventDefault()

    try {
      submit({
        ...group,
        site: group.site,
        checkout_limit_count: group.checkout_limit_count ? +group.checkout_limit_count : 0,
      })
      close()
      clear()
    } catch (err) {
      groupNameRef.current.setCustomValidity(err.message)
      e.target.reportValidity()
    }
  }

  return (
    <Modal className="groupModal" id="tasksGroup" isOpen={isOpen} onRequestClose={close}>
      <form onSubmit={onSubmit}>
        <div className="title">
          <span>{title}</span>
        </div>
        <div className="main">
          <div className="form">
            <div>
              <div className="group">
                <label htmlFor="group_name">Name</label>
                <input
                  ref={groupNameRef}
                  id="group_name"
                  name="group_name"
                  type="text"
                  placeholder="Group Name"
                  pattern={alphaNumSpaceRegex}
                  onInput={alphaNum}
                  required
                  maxLength={32}
                  value={group.group_name}
                  onChange={e => set({ ...group, group_name: e.target.value })}
                />
              </div>

              <div className="group">
                <label htmlFor="group_site">Site</label>
                <Select
                  id="group_site"
                  name="group_site"
                  placeholder="Site"
                  options={sitesList}
                  required
                  value={group.site}
                  onChange={option => set({ ...group, site: option })}
                  isDisabled={disableSelect}
                />
              </div>

              <div className="row">
                <div className="col">
                  <Checkbox
                    id="checkout_limit"
                    name="checkout_limit"
                    type="checkbox"
                    theme="input-checkbox-elem"
                    value={group.checkout_limit}
                    onChange={e => set({ ...group, checkout_limit: e.target.checked })}>
                    Checkout Limit
                  </Checkbox>
                </div>
                <div className="col">
                  <label htmlFor="checkout_limit_count">Limit</label>
                  <input
                    id="checkout_limit_count"
                    name="checkout_limit_count"
                    type="number"
                    placeholder="Limit"
                    pattern={numRegex}
                    onInvalid={num}
                    onInput={num}
                    required
                    maxLength={4}
                    value={group.checkout_limit_count}
                    onChange={e => set({ ...group, checkout_limit_count: e.target.value })}
                    disabled={!group.checkout_limit}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="controls">
          <input type="submit" value={button} />
        </div>
      </form>
    </Modal>
  )
}

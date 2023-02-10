import React, { useRef, useState, useEffect } from 'react'

import './group.scss'
import './tasksCreate.scss'

import Modal from './modal'
import Select from './select'
import { Checkbox } from 'react-input-checkbox'
import {
  // alphaNumSpaceRegex,
  // alphaNum,
  numRegex,
  num,
  productRegex,
  product,
} from './validation'
import { sizes } from './tasksOptions'

const taskManager = window.taskManager

export default ({ isOpen, activeScreen, task, close, set, submit, clear, group, proxies, billing, accounts }) => {
  const [pane, setPane] = useState(0),
    [proxiesList, setProxiesList] = useState([]),
    [sitesList, setSitesList] = useState({})

  const form = useRef(),
    pane0 = useRef(),
    pane1 = useRef(),
    profileNameRef = useRef()

  useEffect(() => {
    isOpen && setPane(0)
  }, [isOpen])

  useEffect(async () => {
    if(activeScreen === 'tasks'){
      set({ ...task, proxy: '', billing: '', accounts: '', shipping_rate: ''})
      setProxiesList(proxies.groups)
      setSitesList(await taskManager.getSites())
    }
  }, [activeScreen])

  useEffect(() => {
    set({ ...task, mode: '', amount: 1 })
  }, [group?.id])

  const checkValidation = e => {
    if (form.current.reportValidity()) return

    let panes = [pane0, pane1]
    for (let i in panes) {
      let err
      panes[i].current.querySelectorAll('input').forEach(input => input.checkValidity() || (err = true))
      if (err) return setPane(+i)
    }
  }

  const proxyOptions = proxiesList
    .filter(group => group.proxies.length > 0)
    .map(group => ({
      label: group.group_name,
      value: group.id,
    }))
  proxyOptions.unshift({ value: '', label: 'No Proxy' })

  const billingOptions = billing.profiles.map(profile => ({
      label: profile.profile_name,
      value: profile.id,
    })),
    accountsOptions = accounts.groups.map(group => ({
      label: group.group_name,
      value: group.id,
    })),
    modes = !group ? [] : sitesList[group.site.value]?.modes,
    automatedRecaptchaOptions = !group ? [] : [{label: 'None', value: ''}, {label: '2Captcha', value: 'twocaptcha'}, {label: 'Capmonster', value: 'capmonster'}]

  const onSubmit = e => {
    e.preventDefault()

    try {
      submit(group.id, {
        ...task,
        mode: task.mode,
        amount: +task.amount,
        proxy: task.proxy,
        billing: task.billing,
        size: task.size.map(x => x),
        accounts: task.accounts ? task.accounts : undefined,
        shipping_rate: task.shipping_rate ? task.shipping_rate : undefined,
        monitor_delay: +task.monitor_delay,
        retry_delay: +task.retry_delay,
        quantity: +task.quantity,
        automatedRecaptcha: task.automatedRecaptcha
      })
    } catch (err) {
      profileNameRef.current.setCustomValidity(err.message)
      e.target.reportValidity()
    }
  }

  const isGroupFootsite = group && ['FOOTLOCKER_US_DESKTOP', 'FOOTLOCKER_CA_DESKTOP', 'KIDSFOOTLOCKER_US_DESKTOP', 'CHAMPSSPORTS_US_DESKTOP', 'FOOTACTION_US_DESKTOP', 'EASTBAY_US_DESKTOP'].includes(group.site.value)

  const isGroupYeezysupply = group && group.site.value === 'YEEZYSUPPLY'

  const isGroupTest = group && ['TEMPLATE_SITE', 'SPEED_TEST'].includes(group.site.value)

  return (
    <Modal className="groupModal" id="tasksCreate" isOpen={isOpen} onRequestClose={close}>
      <form onSubmit={onSubmit} ref={form}>
        <div className="title">
          <span>Task Creation</span>
        </div>
        <div className="nav">
          <div className={pane === 0 ? 'a' : undefined} onClick={() => setPane(0)}>
            Basic
          </div>
          <div className={pane === 1 ? 'a' : undefined} onClick={() => setPane(1)}>
            Advanced
          </div>
        </div>
        <div className="main">
          <div className="form">
            <div ref={pane0} className={pane === 0 ? undefined : 'h'}>
              <div className="row">
                <div className="col">
                  <label htmlFor="task_mode">Mode</label>
                  <Select id="task_mode" name="task_mode" placeholder="Mode" options={modes} required value={task.mode} onChange={option => set({ ...task, mode: option })} />
                </div>
                <div className="col">
                  <label htmlFor="task_amount">Task Amount</label>
                  <input id="task_amount" name="task_amount" type="number" placeholder="0" pattern={numRegex} onInvalid={num} onInput={num} required maxLength={4} value={task.amount} onChange={e => set({ ...task, amount: e.target.value })} />
                </div>
              </div>
              <div className="group">
                <label htmlFor="task_product">Product</label>
                <input ref={profileNameRef} id="task_product" name="task_product" type="text" placeholder="Product" pattern={productRegex} onInput={product} required maxLength={256} value={task.product} onChange={e => set({ ...task, product: e.target.value })} />
              </div>
              <div className="row">
                <div className="col">
                  <label htmlFor="task_proxy">Proxy</label>
                  <Select id="task_proxy" name="task_proxy" placeholder="Proxy" required options={proxyOptions} value={task.proxy} onChange={option => set({ ...task, proxy: option })} />
                </div>
                <div className="col">
                  <label htmlFor="task_billing">Profile</label>
                  <Select id="task_billing" name="task_billing" placeholder="Profile" options={billingOptions} isMulti required value={task.billing} onChange={option => set({ ...task, billing: option || '' })} />
                </div>
              </div>
              <div className="group">
                <label htmlFor="task_size">Size</label>
                <Select id="task_size" name="task_size" placeholder="Size" options={sizes} isMulti required value={task.size} onChange={option => set({ ...task, size: option || '' })} />
              </div>
            </div>
            <div ref={pane1} className={pane === 1 ? undefined : 'h'}>

              {/* <div className="row">
                <div className="col">
                  <label htmlFor="task_accounts">Accounts</label>
                  <Select
                    id="task_accounts"
                    name="task_accounts"
                    placeholder="Accounts"
                    options={accountsOptions}
                    // required
                    value={task.accounts}
                    onChange={option => set({ ...task, accounts: option })}
                  />
                </div>
                <div className="col">
                  <label htmlFor="task_shipping_rate">Shipping Rate</label>
                  <Select
                    id="task_shipping_rate"
                    name="task_shipping_rate"
                    placeholder="Shipping Rate"
                    options={[]}
                    // required
                    value={task.shipping_rate}
                    onChange={option => set({ ...task, shipping_rate: option })}
                  />
                </div>
              </div> */}
              <div className="row">
                <div className="col">
                  <label htmlFor="task_monitor_delay">Monitor Delay</label>
                  <input id="task_monitor_delay" name="task_monitor_delay" type="number" placeholder="Monitor Delay" pattern={numRegex} onInvalid={num} onInput={num} required maxLength={4} value={task.monitor_delay} onChange={e => set({ ...task, monitor_delay: e.target.value })} />
                </div>
                <div className="col">
                  <label htmlFor="task_retry_delay">Retry Delay</label>
                  <input id="task_retry_delay" name="task_retry_delay" type="number" placeholder="Retry Delay" pattern={numRegex} onInvalid={num} onInput={num} required maxLength={4} value={task.retry_delay} onChange={e => set({ ...task, retry_delay: e.target.value })} />
                </div>
              </div>

                {(isGroupFootsite || isGroupTest) &&
                    <div className="row">
                        <div className="col">
                            <label htmlFor="task_captcha">Automated Recaptcha</label>
                            <Select id="task_captcha" name="task_captcha" placeholder="None" options={automatedRecaptchaOptions} value={task.automatedRecaptcha} onChange={option => set({...task, automatedRecaptcha: option})}/>
                        </div>
                    </div>
                }


              {/* <div className="row">
                <div className="col">
                  <label htmlFor="task_quantity">Quantity</label>
                  <input id="task_task_quantity" name="task_task_quantity" type="number" placeholder="Quantity" pattern={numRegex} onInvalid={num} onInput={num} required maxLength={4} value={task.quantity} onChange={e => set({ ...task, quantity: e.target.value })} />
                </div>
                <div className="spacer" />
              </div> */}
              {/* <div className="group" style={{ minHeight: '62px' }}>
                <Checkbox id="task_force_captcha" name="task_force_captcha" type="checkbox" theme="input-checkbox-elem" value={task.force_captcha} onChange={e => set({ ...task, force_captcha: e.target.checked })}>
                  Force Captcha
                </Checkbox>
              </div> */}
            </div>
          </div>
        </div>
        <div className="controls">
          <input onClick={checkValidation} type="submit" value="Create" />
        </div>
      </form>
    </Modal>
  )
}

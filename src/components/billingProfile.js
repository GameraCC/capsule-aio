import React, { useState, useEffect, useRef } from 'react'
import Cards from 'react-credit-cards'

import './group.scss'
import './billingProfile.scss'
import './creditCard.scss'
import Modal from './modal'
import Select from './select'
import { Checkbox } from 'react-input-checkbox'
import { states, countries } from './address'
import { months, years } from './date'
import {
  alphaNum,
  alphaNumSpaceRegex,
  cardNumber,
  cardNumberRegex,
  emailRegex,
  email,
  numRegex,
  securityCode,
  zip,
  phone,
  alphaNumDashRegex,
} from './validation'

export default ({
  profile,
  isOpen,
  close,
  set,
  clear,
  submit,
}) => {
  const [pane, setPane] = useState(0),
    [focus, setFocus] = useState()
    const [shippingStateOptions, setShippingStateOptions] = useState(states.filter(state => state.country === profile.shipping_country.value))
    const [billingStateOptions, setBillingStateOptions] = useState(states.filter(state => state.country === profile.billing_country.value))

  const form = useRef(),
    pane0 = useRef(),
    pane1 = useRef(),
    pane2 = useRef(),
    pane3 = useRef()

  useEffect(() => {
    isOpen && setPane(0)
  }, [isOpen])

  const checkValidation = e => {
    if (form.current.reportValidity()) return

    let panes = [pane0, pane1, pane2, pane3]
    for (let i in panes) {
      let err
      panes[i].current
        .querySelectorAll('input')
        .forEach(input => input.checkValidity() || (err = true))
      if (err) return setPane(+i)
    }
  }

  const onSubmit = e => {
    e.preventDefault()

    submit({
      ...profile
    })
    close()
  }

  return (
    <Modal
      className="groupModal"
      id="billingProfile"
      isOpen={isOpen}
      onRequestClose={close}>
      <form onSubmit={onSubmit} ref={form}>
        <div className="title">
          <span>{profile.profile_name}</span>
        </div>
        <div className="nav">
          <div className={pane === 0 ? 'a' : undefined} onClick={() => setPane(0)}>
            General
          </div>
          <div className={pane === 1 ? 'a' : undefined} onClick={() => setPane(1)}>
            Billing
          </div>
          {profile.same_shipping || (
            <div className={pane === 2 ? 'a' : undefined} onClick={() => setPane(2)}>
              Shipping
            </div>
          )}
          <div className={pane === 3 ? 'a' : undefined} onClick={() => setPane(3)}>
            Payment
          </div>
        </div>
        <div className="main">
          <div className="form">
            <div ref={pane0} className={pane === 0 ? undefined : 'h'}>
              <div className="group">
                <label htmlFor="profile_name">Profile Name</label>
                <input
                  id="profile_name"
                  name="profile_name"
                  type="text"
                  placeholder="Profile Name"
                  pattern={alphaNumSpaceRegex}
                  onInvalid={alphaNum}
                  onInput={alphaNum}
                  required
                  maxLength={32}
                  value={profile.profile_name}
                  onChange={e => set({ ...profile, profile_name: e.target.value })}
                />
              </div>
              <div className="group">
                <label htmlFor="phone_number">Phone Number</label>
                <input
                  id="phone_number"
                  name="phone_number"
                  type="text"
                  placeholder="Phone Number"
                  pattern={numRegex}
                  onInvalid={phone}
                  onInput={phone}
                  required
                  maxLength={64}
                  value={profile.phone_number}
                  onChange={e => set({ ...profile, phone_number: e.target.value })}
                />
              </div>
              <div className="group">
                <label htmlFor="email_address">Email Address</label>
                <input
                  id="email_address"
                  name="email_address"
                  type="text"
                  placeholder="Email Address"
                  pattern={emailRegex}
                  onInvalid={email}
                  onInput={email}
                  required
                  maxLength={64}
                  value={profile.email_address}
                  onChange={e => set({ ...profile, email_address: e.target.value })}
                />
              </div>
              <div className="group">
                <Checkbox
                  id="single_checkout"
                  name="single_checkout"
                  type="checkbox"
                  theme="input-checkbox-elem"
                  value={profile.single_checkout}
                  onChange={e => set({ ...profile, single_checkout: e.target.checked })}>
                  One Checkout per Profile
                </Checkbox>
              </div>
              <div className="group">
                <Checkbox
                  id="same_shipping"
                  name="same_shipping"
                  type="checkbox"
                  theme="input-checkbox-elem"
                  value={profile.same_shipping}
                  onChange={e =>
                    set({
                      ...profile,
                      shipping_first_name: '',
                      shipping_last_name: '',
                      shipping_address_line_1: '',
                      shipping_address_line_2: '',
                      shipping_city: '',
                      shipping_state: '',
                      shipping_zip_code: '',
                      shipping_country: '',
                      same_shipping: e.target.checked,
                    })
                  }>
                  Same Shipping as Billing
                </Checkbox>
              </div>
              <div style={{ height: '20px' }} />
            </div>
            <div ref={pane1} className={pane === 1 ? undefined : 'h'}>
              <div className="row">
                <div className="col">
                  <label htmlFor="billing_first_name">First Name</label>
                  <input
                    id="billing_first_name"
                    name="billing_first_name"
                    type="text"
                    placeholder="First Name"
                    pattern={alphaNumSpaceRegex}
                    onInvalid={alphaNum}
                    onInput={alphaNum}
                    required
                    maxLength={256}
                    value={profile.billing_first_name}
                    onChange={e => set({ ...profile, billing_first_name: e.target.value })}
                  />
                </div>
                <div className="col">
                  <label htmlFor="billing_last_name">Last Name</label>
                  <input
                    id="billing_last_name"
                    name="billing_last_name"
                    type="text"
                    placeholder="Last Name"
                    pattern={alphaNumSpaceRegex}
                    onInvalid={alphaNum}
                    onInput={alphaNum}
                    required
                    maxLength={256}
                    value={profile.billing_last_name}
                    onChange={e => set({ ...profile, billing_last_name: e.target.value })}
                  />
                </div>
              </div>
              <div className="group">
                <label htmlFor="billing_address_line_1">Address 1</label>
                <input
                  id="billing_address_line_1"
                  name="billing_address_line_1"
                  type="text"
                  placeholder="Address 1"
                  pattern={alphaNumSpaceRegex}
                  onInvalid={alphaNum}
                  onInput={alphaNum}
                  required
                  maxLength={256}
                  value={profile.billing_address_line_1}
                  onChange={e => set({ ...profile, billing_address_line_1: e.target.value })}
                />
              </div>
              <div className="row">
                <div className="col">
                  <label htmlFor="billing_address_line_2">Address 2</label>
                  <input
                    id="billing_address_line_2"
                    name="billing_address_line_2"
                    type="text"
                    placeholder="Address 2"
                    pattern={alphaNumSpaceRegex}
                    onInvalid={alphaNum}
                    onInput={alphaNum}
                    maxLength={100}
                    value={profile.billing_address_line_2}
                    onChange={e =>
                      set({ ...profile, billing_address_line_2: e.target.value })
                    }
                  />
                </div>
                <div className="col">
                  <label htmlFor="billing_city">City</label>
                  <input
                    id="billing_city"
                    name="billing_city"
                    type="text"
                    placeholder="City"
                    pattern={alphaNumSpaceRegex}
                    onInvalid={alphaNum}
                    onInput={alphaNum}
                    required
                    maxLength={100}
                    value={profile.billing_city}
                    onChange={e => set({ ...profile, billing_city: e.target.value })}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label htmlFor="billing_state">State</label>
                  <Select
                    id="billing_state"
                    name="billing_state"
                    placeholder="State"
                    options={billingStateOptions}
                    required
                    value={profile.billing_state}
                    onChange={option => set({ ...profile, billing_state: option })}
                  />
                </div>
                <div className="col">
                  <label htmlFor="billing_zip_code">Postal Code</label>
                  <input
                    id="billing_zip_code"
                    name="billing_zip_code"
                    type="text"
                    placeholder="Postal Code"
                    pattern={alphaNumDashRegex}
                    onInvalid={zip}
                    onInput={zip}
                    requireds
                    maxLength={100}
                    value={profile.billing_zip_code}
                    onChange={e => set({ ...profile, billing_zip_code: e.target.value })}
                  />
                </div>
              </div>
              <div className="group">
                <label htmlFor="billing_country">Country</label>
                <Select
                  id="billing_country"
                  name="billing_country"
                  placeholder="Country"
                  options={countries}
                  required
                  value={profile.billing_country}
                  onChange={option => {
                    setBillingStateOptions(states.filter(state => state.country === option.value))
                    
                    set({ ...profile,
                        billing_country: option,
                        // Clear billing state, if new country is chosen, because states are different between countries
                        ...(option.value !== profile.billing_country.value && {
                            billing_state: ''
                        })
                      })
                    }}
                />
              </div>
            </div>
            <div ref={pane2} className={pane === 2 ? undefined : 'h'}>
              {profile.same_shipping || (
                <>
                  <div className="row">
                    <div className="col">
                      <label htmlFor="shipping_first_name">First Name</label>
                      <input
                        id="shipping_first_name"
                        name="shipping_first_name"
                        type="text"
                        placeholder="First Name"
                        pattern={alphaNumSpaceRegex}
                        onInvalid={alphaNum}
                        onInput={alphaNum}
                        required
                        maxLength={256}
                        value={profile.shipping_first_name}
                        onChange={e =>
                          set({ ...profile, shipping_first_name: e.target.value })
                        }
                      />
                    </div>
                    <div className="col">
                      <label htmlFor="shipping_last_name">Last Name</label>
                      <input
                        id="shipping_last_name"
                        name="shipping_last_name"
                        type="text"
                        placeholder="Last Name"
                        pattern={alphaNumSpaceRegex}
                        onInvalid={alphaNum}
                        onInput={alphaNum}
                        required
                        maxLength={256}
                        value={profile.shipping_last_name}
                        onChange={e =>
                          set({ ...profile, shipping_last_name: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="group">
                    <label htmlFor="shipping_address_line_1">Address 1</label>
                    <input
                      id="shipping_address_line_1"
                      name="shipping_address_line_1"
                      type="text"
                      placeholder="Address 1"
                      pattern={alphaNumSpaceRegex}
                      onInvalid={alphaNum}
                      onInput={alphaNum}
                      required
                      maxLength={256}
                      value={profile.shipping_address_line_1}
                      onChange={e =>
                        set({ ...profile, shipping_address_line_1: e.target.value })
                      }
                    />
                  </div>
                  <div className="row">
                    <div className="col">
                      <label htmlFor="shipping_address_line_2">Address 2</label>
                      <input
                        id="shipping_address_line_2"
                        name="shipping_address_line_2"
                        type="text"
                        placeholder="Address 2"
                        pattern={alphaNumSpaceRegex}
                        onInvalid={alphaNum}
                        onInput={alphaNum}
                        maxLength={100}
                        value={profile.shipping_address_line_2}
                        onChange={e =>
                          set({ ...profile, shipping_address_line_2: e.target.value })
                        }
                      />
                    </div>
                    <div className="col">
                      <label htmlFor="shipping_city">City</label>
                      <input
                        id="shipping_city"
                        name="shipping_city"
                        type="text"
                        placeholder="City"
                        pattern={alphaNumSpaceRegex}
                        onInvalid={alphaNum}
                        onInput={alphaNum}
                        required
                        maxLength={100}
                        value={profile.shipping_city}
                        onChange={e => set({ ...profile, shipping_city: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col">
                      <label htmlFor="shipping_state">State</label>
                      <Select
                        id="shipping_state"
                        name="shipping_state"
                        placeholder="State"
                        options={shippingStateOptions}
                        required
                        value={profile.shipping_state}
                        onChange={option => set({ ...profile, shipping_state: option })}
                      />
                    </div>
                    <div className="col">
                      <label htmlFor="shipping_zip_code">Postal Code</label>
                      <input
                        id="shipping_zip_code"
                        name="shipping_zip_code"
                        type="text"
                        placeholder="Postal Code"
                        pattern={alphaNumDashRegex}
                        onInvalid={zip}
                        onInput={zip}
                        required
                        maxLength={100}
                        value={profile.shipping_zip_code}
                        onChange={e =>
                          set({ ...profile, shipping_zip_code: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="group">
                    <label htmlFor="shipping_country">Country</label>
                    <Select
                      id="shipping_country"
                      name="shipping_country"
                      placeholder="Country"
                      options={countries}
                      required
                      value={profile.shipping_country}
                      onChange={option => {
                          setShippingStateOptions(states.filter(state => state.country === option.value))

                          set({ ...profile,
                            shipping_country: option,
                            // Clear shipping state, if new country is chosen, because states are different between countries
                            ...(option.value !== profile.shipping_country.value && {
                                shipping_state: ''
                            })
                          })
                        }}
                    />
                  </div>
                </>
              )}
            </div>
            <div ref={pane3} className={pane === 3 ? undefined : 'h'}>
              <div className="payment-wrapper">
                <div>
                  <div className="group">
                    <label htmlFor="card_name">Card Holder Name</label>
                    <input
                      name="card_name"
                      type="text"
                      placeholder="Card Holder Name"
                      pattern={alphaNumSpaceRegex}
                      onInvalid={alphaNum}
                      onInput={alphaNum}
                      required
                      value={profile.card_name}
                      onChange={e => set({ ...profile, card_name: e.target.value })}
                      onFocus={() => setFocus('name')}
                      onBlur={() => setFocus('')}
                    />
                  </div>
                  <div className="group">
                    <label htmlFor="card_number">Card Number</label>
                    <input
                      name="card_number"
                      type="text"
                      placeholder="Card Number"
                      pattern={cardNumberRegex}
                      onInvalid={cardNumber}
                      onInput={cardNumber}
                      required
                      maxLength={16}
                      value={profile.card_number}
                      onChange={e => set({ ...profile, card_number: e.target.value })}
                      onFocus={() => setFocus('number')}
                      onBlur={() => setFocus('')}
                    />
                  </div>
                  <div className="row">
                    <div className="col">
                      <label htmlFor="card_expiry_month">Exp. Month</label>
                      <Select
                        name="card_expiry_month"
                        placeholder="MM"
                        options={months}
                        required
                        value={profile.card_expiry_month}
                        onChange={option => set({ ...profile, card_expiry_month: option })}
                        onFocus={() => setFocus('expiry')}
                        onBlur={() => setFocus('')}
                      />
                    </div>
                    <div className="col">
                      <label htmlFor="card_expiry_year">Exp. Year</label>
                      <Select
                        name="card_expiry_year"
                        placeholder="YYYY"
                        options={years}
                        required
                        value={profile.card_expiry_year}
                        onChange={option => set({ ...profile, card_expiry_year: option })}
                        onFocus={() => setFocus('expiry')}
                        onBlur={() => setFocus('')}
                      />
                    </div>
                    <div className="col">
                      <label htmlFor="card_security_code">CVV</label>
                      <input
                        name="card_security_code"
                        type="text"
                        placeholder="CVV"
                        pattern={numRegex}
                        onInvalid={securityCode}
                        onInput={securityCode}
                        required
                        maxLength={4}
                        value={profile.card_security_code}
                        onChange={e =>
                          set({ ...profile, card_security_code: e.target.value })
                        }
                        onFocus={() => setFocus('cvc')}
                        onBlur={() => setFocus('')}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <div className="group">
                    <Cards
                      name={profile.card_name}
                      number={profile.card_number}
                      cvc={profile.card_security_code}
                      expiry={`${profile.card_expiry_month.value || ''}/${
                        profile.card_expiry_year.value || ''
                      }`}
                      acceptedCards={['visa', 'mastercard', 'amex', 'discover']}
                      focused={focus}
                      callback={({ issuer }) => set({ ...profile, card_type: issuer })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="controls">
          <input onClick={checkValidation} type="submit" value="Save" />
          <button
            onClick={e => {
              e.preventDefault()
              clear()
            }}>
            Clear
          </button>
        </div>
      </form>
    </Modal>
  )
}

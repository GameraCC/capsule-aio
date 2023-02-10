import React, { useState } from 'react'

import './settings.scss'
import Header from './header'
import {version} from '../../package.json'
import colors from './colors.module.scss'

import qqPhoto from '../img/qq.jpg'

export default ({ activeScreen, settings: { webhook, twocaptcha, capmonster, twocaptchaStatusMessage, capmonsterStatusMessage, twocaptchaStatusMessageType, capmonsterStatusMessageType, id: discordId, username, discriminator, avatar }, updateWebhook, updateTwocaptcha, updateCapmonster, handleCheckBalance, sendWebhook, license }) => {
  const showInput = e => {
    const ele = e.target
    ele.classList.add('active')
    ele.disabled = false
    setTimeout(() => {
      ele.classList.remove('active')
      ele.disabled = true
    }, 30000)
  }

  return (
    <div id="settings" className={activeScreen === 'settings' ? 'a' : undefined}>
      <Header title="Settings" />
      <div className="body">
          
        <div className="wrapper">
          <div className="header"></div>
          <div className="body">
            <div className="license">
              <div>License Key</div>
              <input className="key" type="text" value={license} onClick={showInput} readOnly />
              <div className="renewal">
                <span>Renewal Date:</span>
                <span className="sp">4/20/20</span>
              </div>
            </div>
            <div className="webhook">
              <div>
                <span>Webhook</span>
              </div>
              <input className="webhook" type="text" value={webhook} onChange={e => updateWebhook(e.target.value)} onClick={showInput} />
              <button className="webhookTest" onClick={e => sendWebhook()}>Test</button>
            </div>
          </div>
        </div>

        <div className="wrapper">
          <div className="header"></div>
          <div className="body">
            <div className="discord">
              <div className="portrait">{discordId && avatar ? <img src={`https://cdn.discordapp.com/avatars/${discordId}/${avatar}.png`} alt="" /> : <img src={qqPhoto} alt="" />}</div>
              <div className="name">
                <span>{username}</span>
                <span>{discriminator}</span>
              </div>
            </div>
            <div className="version">
              <div className="number">
                <span>Version:</span>
                <span className="sp">{version}</span>
              </div>
              <button className="checkUpdate">Check for Updates</button>
            </div>
          </div>
        </div>
        <div className="wrapper" style={{flex: '1 1 100%'}}>
          <div className="header"></div>
          <div className="body">
            <div className="twocaptcha">
              <div>2Captcha API Key</div>
              <input className="twocaptchaApiKey" type="text" value={twocaptcha} onChange={e => updateTwocaptcha(e.target.value)} onClick={showInput} />
              <div className="status">
                <span style={{ height: '1em', fontSize: '1em', margin: '.25em', color: twocaptchaStatusMessageType === 'error' ? colors.red : twocaptchaStatusMessageType === 'success' ? colors.green : colors.yellow }}>{twocaptchaStatusMessage}</span>
              </div>
              <button className="twocaptchaTest" onClick={() => handleCheckBalance('twocaptcha')}>Check Balance</button>
            </div>
            <div className="capmonster">
              <div>
                <span>Capmonster API Key</span>
              </div>
              <input className="capmonsterApiKey" type="text" value={capmonster} onChange={e => updateCapmonster(e.target.value)} onClick={showInput} />
              <div className="status">
                <span style={{ height: '1em', fontSize: '1em', margin: '.25em', color: capmonsterStatusMessageType === 'error' ? colors.red : capmonsterStatusMessageType === 'success' ? colors.green : colors.yellow }}>{capmonsterStatusMessage}</span>
              </div>
              <button className="capmonsterTest" onClick={() => handleCheckBalance('capmonster')}>Check Balance</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

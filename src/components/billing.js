import React, { useRef } from 'react'
import { CSSTransition, TransitionGroup } from 'react-transition-group'

import './billing.scss'
import { SearchHeader } from './header'
import BillingProfile from './billingProfile'

import editIcon from '../img/pen.svg'
import trashIcon from '../img/trash.svg'

import { ImportIcon, ExportIcon } from './headerIcons'

export default ({ activeScreen, profiles, billingProfile, billingProfilesUpdate }) => (
  <>
    <div id="billing" className={activeScreen === 'billing' ? 'a' : undefined}>
      <SearchHeader
        title="Billing"
        count={profiles.length}
        buttons={[
          {
            name: 'Create',
            onClick: () => {
              billingProfile.clear()
              billingProfile.open()
            },
          },
        ]}>
        <ImportIcon onClick={async () => {
          try{
            await window.store.import.billing()
            billingProfilesUpdate()
          }catch (err){
            // TODO
            console.error('Unable to import profiles.')
          }
        }} />
        <ExportIcon onClick={async () => {
          try{
            await window.store.export.billing()
          } catch(err){
            // TODO
            console.error('Unable to export profiles.')
          }
        }} />
      </SearchHeader>
      <TransitionGroup className={`groups${profiles.length === 0 ? ' empty' : ''}`} component="div">
        {profiles.map(profile => (
          <CSSTransition
            timeout={500}
            classNames="domfade"
            key={profile.profile_name}
            unmountOnExit>
            <Profile
              name={profile.profile_name}
              last4={profile.card_number.substring(profile.card_number.length - 4)}
              remove={() => billingProfile.delete(profile.id)}
              edit={() => billingProfile.edit(profile.profile_name)}
            />
          </CSSTransition>
        ))}
      </TransitionGroup>
    </div>

    {/* Billing Profile modal */}
    <BillingProfile {...billingProfile} />
  </>
)

const Profile = ({ name, last4, remove, edit }) => {
  const deleteBtn = useRef()

  return (
    <div className="group" onDoubleClick={e => deleteBtn.current.contains(e.target) || edit(e)}>
      <div className="wrapper">
        <div className="title">
          <div className="name">{name}</div>
          <div className="last4">
            Ending in <span>{last4}</span>
          </div>
        </div>
        <div className="controls">
          <div className="edit" onClick={edit}>
            <img src={editIcon} alt="edit" />
          </div>
          <div className="delete" onDoubleClick={remove} ref={deleteBtn}>
            <img src={trashIcon} alt="delete" />
          </div>
        </div>
      </div>
    </div>
  )
}

import React from 'react'

import { default as CreateAccountsGroupModal } from './modalInput'
import { default as DeleteAccountsGroupModal } from './modalConfirm'
import { default as AddAccountsModal } from './modalAdd'
import { SelectHeader } from './header'

import profile from '../img/profile.svg'
import lock from '../img/lock.svg'
import actions from '../img/actions.svg'

import { Trash } from './actions'
import { PlusIcon } from './headerIcons'
import key from 'weak-key'

export default ({
  activeScreen,
  activeGroup,
  setActiveGroup,
  accountsGroupCreate,
  accountsGroupDelete,
  accountsAdd,
  accounts,
  deleteAccounts,
}) => {
  const options = accounts.groups.map(({ id, group_name }) => ({
    value: id,
    label: group_name,
  }))

  return (
    <>
      <div id="accounts" className={'tableView' + (activeScreen === 'accounts' ? ' a' : '')}>
        <SelectHeader
          title="Accounts"
          buttons={[
            { name: 'Create', onClick: () => accountsGroupCreate.open() },
            { name: 'Delete', onClick: activeGroup ? () => accountsGroupDelete.open() : undefined },
          ]}
          count={
            activeGroup && accounts.groups.find(group => group.id === activeGroup).accounts.length
          }
          placeholder="Select Group"
          options={options}
          value={activeGroup ? options.find(value => value === activeGroup) : undefined}
          onChange={({ value }) => setActiveGroup(value)}>
          <PlusIcon onClick={activeGroup && accountsAdd.open} />
        </SelectHeader>
        <div
          className={
            'table' +
            (!activeGroup
              ? ' noselection'
              : accounts.groups.find(group => group.id === activeGroup).accounts.length === 0
              ? ' empty'
              : '')
          }>
          <table>
            <thead>
              <tr>
                <th className="email">
                  Email
                  <img src={profile} alt="" />
                </th>
                <th className="password">
                  Password
                  <img src={lock} alt="" />
                </th>
                <th className="actions">
                  Actions
                  <img src={actions} alt="" />
                </th>
              </tr>
            </thead>
            <tbody>
              {activeGroup &&
                accounts.groups
                  .find(group => group.id === activeGroup)
                  .accounts.map(account => (
                    <tr key={key(account)}>
                      <td className="email">{account.email}</td>
                      <td className="password">{account.password}</td>
                      <td className="actions">
                        <div className="actions-controls">
                          <Trash onDoubleClick={() => deleteAccounts(activeGroup, [ account ])} />
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Accounts Group Create Modal */}
      <CreateAccountsGroupModal
        isOpen={accountsGroupCreate.isOpen}
        onRequestClose={accountsGroupCreate.close}
        onSubmit={groupName => {
          accountsGroupCreate.submit(groupName)
          accountsGroupCreate.close()
        }}
        message="New Accounts Group"
        confirm="Create"
      />

      {/* Accounts Group Delete Modal */}
      <DeleteAccountsGroupModal
        isOpen={accountsGroupDelete.isOpen}
        onRequestClose={accountsGroupDelete.close}
        onSubmit={() => {
          setActiveGroup(undefined)
          accountsGroupDelete.submit(activeGroup)
          accountsGroupDelete.close()
        }}
        message={`Delete group ${
          activeGroup && accounts.groups.find(x => x.id === activeGroup).group_name
        }?`}
      />

      {/* Accounts Add Modal */}
      <AddAccountsModal
        isOpen={accountsAdd.isOpen}
        onRequestClose={accountsAdd.close}
        onSubmit={newAccounts => {
          accountsAdd.submit(activeGroup, newAccounts)
          accountsAdd.close()
        }}
        message="Add Accounts"
        placeholder="username:password"
      />
    </>
  )
}

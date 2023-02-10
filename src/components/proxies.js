import React from 'react'

import { default as CreateProxiesGroupModal } from './modalInput'
import { default as DeleteProxiesGroupModal } from './modalConfirm'
import { default as AddProxiesModal } from './modalAdd'
import { SelectHeader } from './header'

import proxy from '../img/proxy.svg'
import status from '../img/status.svg'
import actions from '../img/actions.svg'
import { Play, Pause, Trash } from './actions'
import { PlusIcon, TrashIcon, TestIcon, ImportIcon, ExportIcon } from './headerIcons'

export default ({ activeScreen, proxies, testProxy, cancelTestProxy, testProxies, cancelTestProxies, activeGroup, setActiveGroup, proxiesGroupCreate, proxiesGroupDelete, proxiesAdd, deleteProxies }) => {
  const options = proxies.groups.map(({ id, group_name }) => ({
    value: id,
    label: group_name,
  }))

  const testClick = (() => {
    if (proxies.test && proxies.test.isPending()) return () => activeGroup && cancelTestProxies()
    else return () => activeGroup && testProxies(activeGroup)
  })()

  return (
    <>
      <div id="proxies" className={'tableView' + (activeScreen === 'proxies' ? ' a' : '')}>
        <SelectHeader
          title="Proxies"
          buttons={[
            { name: 'Create', onClick: () => proxiesGroupCreate.open() },
            {
              name: 'Delete',
              onClick: activeGroup ? () => proxiesGroupDelete.open() : undefined,
            },
          ]}
          count={activeGroup && proxies.groups.find(group => group.id === activeGroup).proxies.length}
          placeholder="Select Group"
          options={options}
          value={options.find(({value}) => value === activeGroup) || ''}
          onChange={({ value }) => setActiveGroup(value)}>
          <PlusIcon onClick={activeGroup && proxiesAdd.open} />
          <TrashIcon />
          <TestIcon onClick={testClick} />
          <ImportIcon />
          <ExportIcon />
        </SelectHeader>
        <div className={'table' + (!activeGroup ? ' noselection' : proxies.groups.find(group => group.id === activeGroup).proxies.length === 0 ? ' empty' : '')}>
          <table>
            <thead>
              <tr>
                <th className="proxy">
                  Proxy
                  <img src={proxy} alt="" />
                </th>
                <th className="status">
                  Status
                  <img src={status} alt="" />
                </th>
                <th className="speed">Speed</th>
                <th className="actions">
                  Actions
                  <img src={actions} alt="" />
                </th>
              </tr>
            </thead>
            <tbody>
              {activeGroup &&
                proxies.groups
                  .find(group => group.id === activeGroup)
                  .proxies.map(proxy => (
                    <tr key={`http://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`}>
                      <td className="proxy">
                        {proxy.host}:{proxy.port}
                        {proxy.username && `:${proxy.username}:${proxy.password}`}
                      </td>
                      <td className={proxy.status === 'Online' ? 'text-green' : proxy.status === 'Offline' ? 'text-red' : proxy.status === 'Testing' ? 'text-base4' : undefined}>{proxy.status}</td>
                      <td className={proxy.speed && proxy.speed < 300 ? 'text-green' : proxy.speed < 500 ? 'text-yellow' : proxy.speed < 1000 ? 'text-orange' : 'text-red'}>{proxy.speed}</td>
                      <td className="actions">
                        <div className="actions-controls">
                          <Play onClick={() => testProxy(activeGroup, proxy)} />
                          <Pause onClick={() => cancelTestProxy(activeGroup, proxy)} />
                          <Trash onDoubleClick={() => deleteProxies(activeGroup, [proxy])} />
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Proxies Group Modal */}
      <CreateProxiesGroupModal
        isOpen={proxiesGroupCreate.isOpen}
        onRequestClose={proxiesGroupCreate.close}
        onSubmit={groupName => {
          proxiesGroupCreate.submit(groupName)
          proxiesGroupCreate.close()
        }}
        message="New Proxies Group"
        confirm="Create"
      />

      {/* Delete Prodies Group Modal */}
      <DeleteProxiesGroupModal
        isOpen={proxiesGroupDelete.isOpen}
        onRequestClose={proxiesGroupDelete.close}
        onSubmit={() => {
          proxiesGroupDelete.submit(activeGroup)
          proxiesGroupDelete.close()
        }}
        message={`Delete group ${activeGroup && proxies.groups.find(x => x.id === activeGroup).group_name}?`}
      />

      {/* Add Proxies Modal */}
      <AddProxiesModal
        isOpen={proxiesAdd.isOpen}
        onRequestClose={proxiesAdd.close}
        onSubmit={newProxies => {
          proxiesAdd.submit(activeGroup, newProxies)
          proxiesAdd.close()
        }}
        message="Add Proxies"
        placeholder="host:port:username:password"
      />
    </>
  )
}

const Proxy = ({ proxy, onTest, onCancel, onDelete }) => {
  return (
    <tr>
      <td className="proxy">
        {proxy.host}:{proxy.port}
        {proxy.username && `:${proxy.username}:${proxy.password}`}
      </td>
      <td className={proxy.status === 'Online' ? 'text-green' : proxy.status === 'Offline' ? 'text-red' : proxy.status === 'Testing' ? 'text-base4' : undefined}>{proxy.status}</td>
      <td className={proxy.speed && proxy.speed < 300 ? 'text-green' : proxy.speed < 500 ? 'text-yellow' : proxy.speed < 1000 ? 'text-orange' : 'text-red'}>{proxy.speed}</td>
      <td className="actions">
        <div className="actions-controls">
          <Play onClick={onTest} />
          <Pause onClick={onCancel} />
          <Trash onDoubleClick={onDelete} />
        </div>
      </td>
    </tr>
  )
}

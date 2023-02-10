import React, { useEffect } from 'react'
import { CSSTransition, TransitionGroup } from 'react-transition-group'

import './tasks.scss'
import { default as DeleteTasksGroupModal } from './modalConfirm'
import { SearchHeader } from './header'
import { default as TasksGroupNew, default as TasksGroupEdit } from './tasksGroup'
import TasksCreate from './tasksCreate'
import ReactComment from './comment'
import { proxyFormat } from './validation'
import { Checkbox } from 'react-input-checkbox'

import { Play, Pause, Trash } from './actions'
import { PlusIcon, TrashIcon, PenIcon, GearIcon } from './headerIcons'
import product from '../img/product.svg'
import size from '../img/size.svg'
import profile from '../img/profile.svg'
import proxy from '../img/proxy.svg'
import statusImg from '../img/status.svg'
import actions from '../img/actions.svg'

export default ({ activeScreen, activeGroup, setActiveGroup, tasks, tasksCreate, tasksGroupNew, tasksGroupEdit, tasksGroupDelete, taskDelete, taskStart, taskStartAll, taskStop, taskStopAll, taskToggleAll, taskCheckAll, taskUncheckAll }) => {
  useEffect(() => {
    if (!activeGroup && tasks.groups.length > 0) setActiveGroup(tasks.groups[0].id)
  }, [activeGroup, setActiveGroup, tasks.groups])

  return (
    <>
      <div id="tasks" className={activeScreen === 'tasks' ? 'a' : undefined}>
        <div id="TaskGroups">
          <div className="header">
            <span>Groups</span>
            <div className="add" onClick={tasksGroupNew.open}>
              <span>+</span>
            </div>
          </div>
          <TransitionGroup className="groups" component="div">
            {tasks.groups.map(group => (
              <CSSTransition timeout={500} classNames="domfade" key={group.id} unmountOnExit>
                <div className={`group${activeGroup === group.id ? ' a' : ''}`} onClick={() => setActiveGroup(group.id)}>
                  <div className="title">{group.site.label}</div>
                  <div className="description">{group.group_name}</div>
                  {activeGroup === group.id && (
                    <div className="delete" onClick={tasksGroupDelete.open}>
                      <span>x</span>
                    </div>
                  )}
                </div>
              </CSSTransition>
            ))}
          </TransitionGroup>
        </div>
        <div className="main">
          <SearchHeader
            title="Tasks"
            count={activeGroup && tasks.groups.find(group => group.id === activeGroup)?.tasks.length}
            buttons={[
              {
                name: 'Start',
                onClick: () => taskStartAll(activeGroup),
              },
              {
                name: 'Stop',
                onClick: () => taskStopAll(activeGroup),
              },
            ]}>
            <PlusIcon onClick={() => activeGroup && tasksCreate.open()} />
            <TrashIcon />
            <PenIcon />
            <GearIcon onClick={() => activeGroup && tasksGroupEdit.set(tasks.groups.find(x => x.id === activeGroup)) && tasksGroupEdit.open()} />
          </SearchHeader>
          <div className={'table' + (!activeGroup ? ' noselection' : tasks.groups.find(group => group.id === activeGroup)?.tasks.length === 0 ? ' empty' : '')}>
            <table>
              <thead>
                <tr>
                  <th className="checkbox">
                    <Checkbox type="checkbox" theme="input-checkbox-elem">{' '}</Checkbox>
                  </th>
                  <th className="product">
                    Product
                    <img src={product} alt="" />
                  </th>
                  <th className="size">
                    Size
                    <img src={size} alt="" />
                  </th>
                  <th className="billing">
                    Profile
                    <img src={profile} alt="" />
                  </th>
                  <th className="proxies">
                    Proxy
                    <img src={proxy} alt="" />
                  </th>
                  <th className="status">
                    Status
                    <img src={statusImg} alt="" />
                  </th>
                  <th className="actions">
                    Actions
                    <img src={actions} alt="" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {activeGroup &&
                  tasks.groups
                    .find(group => group.id === activeGroup)
                    ?.tasks.map(task => {
                      const tdProps = {
                        onMouseEnter: e => (e.buttons === 1 || e.buttons === 3) && taskToggleAll([task.id]),
                        onMouseDown: () => taskToggleAll([task.id]),
                      }

                      return (
                        <tr key={task.id}>
                          <td className="checkbox" {...tdProps} >
                            <Checkbox onChange={() => true} type="checkbox" theme="input-checkbox-elem" value={task.checked}>
                              {' '}
                            </Checkbox>
                          </td>
                          <td className="product" {...tdProps} >
                            <ReactComment>{JSON.stringify(task, null, 2)}</ReactComment>
                            <div>{task.taskUpdates?.product || task.product}</div>
                          </td>
                          <td className="size" {...tdProps}>{task.taskUpdates?.size || task.current.productArgs?.size?.map(({ label }) => label).join(', ')}</td>
                          <td className="billing" {...tdProps}>{task.taskUpdates?.billing || task.current.profile?.profile_name}</td>
                          <td className="proxies" {...tdProps}>{task.taskUpdates?.proxy || task.proxy.label}</td>
                          <td className="status" {...tdProps}>
                            <div className={task.status ? task.status : 'status'}>{task.msg ? task.msg : ' '}</div>
                          </td>
                          <td className="actions">
                            <div className="actions-controls">
                              <Play onClick={() => taskStart(task.id)} />
                              <Pause onClick={() => taskStop(task.id)} />
                              <Trash onClick={() => taskDelete(task.id)} />
                            </div>
                          </td>
                        </tr>
                      )
                    })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Task Group Modal */}
      <TasksGroupNew {...tasksGroupNew} title="Group Creation" button="Create" />

      {/* Edit Task Group Modal */}
      <TasksGroupEdit {...tasksGroupEdit} title="Group Edit" button="Save" disableSelect={true} />

      {/* Create Tasks Modal */}
      <TasksCreate {...tasksCreate} />

      {/* Tasks Group Delete Confirm Modal */}
      <DeleteTasksGroupModal
        isOpen={tasksGroupDelete.isOpen}
        onRequestClose={tasksGroupDelete.close}
        onSubmit={() => {
          tasksGroupDelete.submit(activeGroup)
          tasksGroupDelete.close()
        }}
        message={`Delete group ${activeGroup && tasks.groups.find(group => group.id == activeGroup)?.group_name}?
        `}
      />
    </>
  )
}

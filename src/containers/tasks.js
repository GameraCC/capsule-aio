import { connect } from 'react-redux'

import Tasks from '../components/tasks'
import { tasksGroupSetActive, tasksCreateOpen, tasksCreateClose, tasksCreateSet, tasksGroupDeleteOpen, tasksGroupDeleteClose, tasksGroupNewOpen, tasksGroupNewClose, tasksGroupNewSet, tasksGroupNewClear, tasksGroupEditOpen, tasksGroupEditClose, tasksGroupEditSet } from '../actions/app'
import { saveNewTask, saveNewTasksGroup, editTaskGroup, deleteTasksGroup, deleteTask, startTask, startAllTasks, stopTask, stopAllTasks, toggleTaskChecks, checkAllTasks, uncheckAllTasks } from '../actions/tasks'

const mapStateToProps = ({
  app: {
    activeScreen,
    tasks: { activeGroup },
    tasksCreate,
    tasksGroupNew,
    tasksGroupEdit,
    tasksGroupDelete,
  },
  tasks,
  proxies,
  billing,
  accounts,
}) => ({
  activeScreen,
  activeGroup,
  tasks,
  tasksCreate: {
    ...tasksCreate,
    activeScreen,
    proxies,
    billing,
    accounts,
    group: tasks.groups.find(x => x.id === activeGroup),
  },
  tasksGroupNew,
  tasksGroupEdit: {
    ...tasksGroupEdit,
  },
  tasksGroupDelete: {
    ...tasksGroupDelete,
    group: activeGroup,
  },
})

const mapDispatchToProps = dispatch => ({
  setActiveGroup: id => dispatch(tasksGroupSetActive(id)),
  taskDelete: id => dispatch(deleteTask(id)),
  taskStart: id => dispatch(startTask(id)),
  taskStartAll: groupId => dispatch(startAllTasks(groupId)),
  taskStop: id => dispatch(stopTask(id)),
  taskStopAll: groupId => dispatch(stopAllTasks(groupId)),
  taskToggleAll: arr => dispatch(toggleTaskChecks(arr)),
  taskCheckAll: arr => dispatch(checkAllTasks(arr)),
  taskUncheckAll: arr => dispatch(uncheckAllTasks(arr)),
  tasksCreate: {
    open: () => dispatch(tasksCreateOpen()),
    close: () => dispatch(tasksCreateClose()),
    submit: (groupId, task) => dispatch(saveNewTask(groupId, task)),
    set: task => dispatch(tasksCreateSet(task)),
  },
  tasksGroupNew: {
    open: () => dispatch(tasksGroupNewOpen()),
    close: () => dispatch(tasksGroupNewClose()),
    submit: group => dispatch(saveNewTasksGroup(group)),
    set: group => dispatch(tasksGroupNewSet(group)),
    clear: () => dispatch(tasksGroupNewClear()),
  },
  tasksGroupEdit: {
    open: () => dispatch(tasksGroupEditOpen()),
    close: () => dispatch(tasksGroupEditClose()),
    submit: group => dispatch(editTaskGroup(group)),
    set: group => dispatch(tasksGroupEditSet(group)),
  },
  tasksGroupDelete: {
    open: () => dispatch(tasksGroupDeleteOpen()),
    close: () => dispatch(tasksGroupDeleteClose()),
    submit: id => dispatch(deleteTasksGroup(id)),
  },
})

const mergeProps = (propsFromState, propsFromDispatch, ownProps) => ({
  ...propsFromState,
  ...propsFromDispatch,
  ...ownProps,
  tasksCreate: {
    ...propsFromDispatch.tasksCreate,
    ...propsFromState.tasksCreate,
  },
  tasksGroupNew: {
    ...propsFromDispatch.tasksGroupNew,
    ...propsFromState.tasksGroupNew,
  },
  tasksGroupEdit: {
    ...propsFromDispatch.tasksGroupEdit,
    ...propsFromState.tasksGroupEdit,
  },
  tasksGroupDelete: {
    ...propsFromDispatch.tasksGroupDelete,
    ...propsFromState.tasksGroupDelete,
  },
})

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(Tasks)

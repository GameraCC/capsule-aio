import { connect } from 'react-redux'

import Proxies from '../components/proxies'

import { proxiesGroupCreateOpen, proxiesGroupCreateClose, proxiesGroupDeleteOpen, proxiesGroupDeleteClose, proxiesAddOpen, proxiesAddClose, proxiesGroupSetActive } from '../actions/app'

import { addProxies, deleteProxies, testProxy, cancelTestProxy, testProxies, cancelTestProxies, saveNewProxiesGroup, deleteProxiesGroup } from '../actions/proxies'

const mapStateToProps = ({
  app: {
    activeScreen,
    proxies: { activeGroup },
    proxiesGroupCreate,
    proxiesGroupDelete,
    proxiesAdd,
  },
  proxies,
}) => ({ activeScreen, activeGroup, proxies, proxiesGroupCreate, proxiesGroupDelete, proxiesAdd })

const mapDispatchToProps = dispatch => ({
  setActiveGroup: group_name => dispatch(proxiesGroupSetActive(group_name)),
  deleteProxies: (groupId, proxyArr) => dispatch(deleteProxies(groupId, proxyArr)),
  testProxy: (groupId, proxy) => dispatch(testProxy(groupId, proxy)),
  cancelTestProxy: (groupId, proxy) => dispatch(cancelTestProxy(groupId, proxy)),
  testProxies: (groupId) => dispatch(testProxies(groupId)),
  cancelTestProxies: () => dispatch(cancelTestProxies()),
  proxiesAddOpen: () => dispatch(proxiesAddOpen()),
  proxiesGroupCreate: {
    open: () => dispatch(proxiesGroupCreateOpen()),
    close: () => dispatch(proxiesGroupCreateClose()),
    submit: groupName => dispatch(saveNewProxiesGroup(groupName)),
  },
  proxiesGroupDelete: {
    open: () => dispatch(proxiesGroupDeleteOpen()),
    close: () => dispatch(proxiesGroupDeleteClose()),
    submit: groupId => dispatch(deleteProxiesGroup(groupId)),
  },
  proxiesAdd: {
    open: () => dispatch(proxiesAddOpen()),
    close: () => dispatch(proxiesAddClose()),
    submit: (groupId, proxies) => dispatch(addProxies(groupId, proxies)),
  },
})

const mergeProps = (propsFromState, propsFromDispatch, ownProps) => ({
  ...propsFromState,
  ...propsFromDispatch,
  ...ownProps,
  proxiesGroupCreate: {
    ...propsFromDispatch.proxiesGroupCreate,
    ...propsFromState.proxiesGroupCreate,
  },
  proxiesGroupDelete: {
    ...propsFromDispatch.proxiesGroupDelete,
    ...propsFromState.proxiesGroupDelete,
  },
  proxiesAdd: {
    ...propsFromDispatch.proxiesAdd,
    ...propsFromState.proxiesAdd,
  },
})

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(Proxies)

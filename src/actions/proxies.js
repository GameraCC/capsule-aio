import async from 'async'
import { v4 as uuidv4 } from 'uuid'
import { Promise } from 'bluebird'

import { PROXIES_NEW_GROUP, PROXIES_DELETE_GROUP, PROXIES_CLEAR_GROUP, PROXIES_ADD_PROXIES, PROXIES_DELETE_PROXIES, PROXIES_TEST_UPDATE, PROXIES_TEST } from './types'
import { proxiesGroupSetActive } from './app'
import { proxyPattern, proxyComparer as comparer } from '../components/validation'

import test from '../components/proxiesTest'

const taskManager = window.taskManager

const testLimit = 4

const newGroup = group => ({
  type: PROXIES_NEW_GROUP,
  group,
})

const deleteGroup = groupId => ({
  type: PROXIES_DELETE_GROUP,
  groupId,
})

const clearGroup = groupId => ({
  type: PROXIES_CLEAR_GROUP,
  groupId,
})

const newProxies = (groupId, proxies) => ({
  type: PROXIES_ADD_PROXIES,
  groupId,
  proxies,
})

const delProxies = (groupId, proxies) => ({
  type: PROXIES_DELETE_PROXIES,
  groupId,
  proxies,
})

const updateProxiesTest = (groupId, proxies) => ({
  type: PROXIES_TEST_UPDATE,
  groupId,
  proxies,
})

const startProxiesTest = test => ({
  type: PROXIES_TEST,
  test,
})

export const saveNewProxiesGroup = group_name => (dispatch, getState) => {
  if (group_name.trim().length === 0) throw new Error('Invalid group name.')
  if (group_name.toLowerCase().trim() === 'no proxy') throw new Error('Group name is a reserved name.')

  const { proxies } = getState()

  if (proxies.groups.some(group => group.group_name.toLowerCase().trim() === group_name.toLowerCase().trim())) throw new Error(`Group ${group_name} already exists.`)

  const id = uuidv4()

  // Taskmanager code:
  // Create group in proxymanager
  taskManager.proxyManager.createGroup({ id, group_name })

  dispatch(newGroup({ group_name, id, proxies: [] }))
  dispatch(proxiesGroupSetActive(id))
}

export const deleteProxiesGroup = id => (dispatch, getState) => {
  const { proxies } = getState()

  if (!proxies.groups.some(group => group.id === id)) throw new Error(`Group ${id} doesn't exist.`)

  // Taskmanager code:
  // Delete group from proxymanager
  taskManager.proxyManager.deleteGroup({ id })

  dispatch(deleteGroup(id))
  dispatch(proxiesGroupSetActive(undefined))
}

export const clearProxies = id => (dispatch, getState) => {
  const { proxies } = getState()

  if (!proxies.groups.some(group => group.id === id)) throw new Error(`Group ${id} doesn't exist.`)

  // Taskmanager code:
  // Clear proxies from this group in proxymanager
  proxies.groups.find(group => group.id === id).proxies.forEach(proxy => taskManager.proxyManager.deleteProxy({ id, proxy }))

  dispatch(clearGroup(id))
}

export const addProxies = (id, proxyArr) => (dispatch, getState) => {
  const { proxies } = getState()

  const group = proxies.groups.find(group => group.id === id)
  if (!group) throw new Error(`Group ${id} doesn't exist.`)

  const regex = proxyPattern

  let parsedProxies = []
  let match

  while ((match = regex.exec(proxyArr))) {
    const { host, port, username, password, auth } = match.groups

    if (!parsedProxies.some(comparer(match.groups)) && !group.proxies.some(comparer(match.groups)))
      parsedProxies.push({
        host,
        port,
        username: auth ? username : undefined,
        password: auth ? password : undefined,
      })
  }

  // Taskmanager code:
  // Add proxies to this group in proxymanager
  parsedProxies.forEach(proxy => taskManager.proxyManager.addProxy({ id, proxy }))

  dispatch(newProxies(id, parsedProxies))
}

export const deleteProxies = (id, proxyArr) => (dispatch, getState) => {
  const { proxies } = getState()

  // if (proxies.test && proxies.test.isPending()) return

  if (!proxies.groups.some(group => group.id === id)) throw new Error(`Group ${groupId} doesn't exist.`)
  if (proxies.groups.find(group => group.id === id)?.proxies.some(proxy => proxyArr.some(({ host, port }) => `${host.toLowerCase().trim()}:${port.toLowerCase().trim()}` === `${proxy.host.toLowerCase().trim()}:${proxy.port.toLowerCase().trim()}`) && proxy.test && proxy.test.isPending())) return

  // Taskmanager code:
  // Delete proxies from this group in proxymanager
  proxyArr.forEach(proxy => taskManager.proxyManager.deleteProxy({ id, proxy }))

  dispatch(delProxies(id, proxyArr))
}

export const cancelTestProxies = () => (dispatch, getState) => {
  const { proxies } = getState()

  if (!proxies.test || !proxies.test.isPending()) return

  proxies.test.cancel()
}

export const testProxies = id => async (dispatch, getState) => {
  const { proxies } = getState()

  const group = proxies.groups.find(group => group.id === id)
  if (!group) throw new Error(`Group ${groupId} doesn't exist.`)

  if (proxies.test && proxies.test.isPending()) return

  const proxyArr = group.proxies.filter(proxy => !proxy.test?.isPending())

  const tests = []

  proxyArr.forEach(proxy => {
    proxy.status = 'Testing'
    proxy.speed = undefined
  })

  dispatch(updateProxiesTest(id, proxyArr))

  proxyArr.forEach(proxy =>
    tests.push(async () => {
      try {
        proxy.test = test(proxy)
        dispatch(updateProxiesTest(id, [proxy]))

        proxy.speed = await proxy.test
        proxy.status = 'Online'
      } catch (err) {
        proxy.status = 'Offline'
        proxy.speed = undefined
      }

      dispatch(updateProxiesTest(id, [proxy]))
    }),
  )

  dispatch(
    startProxiesTest(
      new Promise(async (resolve, reject, onCancel) => {
        onCancel(() => {
          tests.length = 0

          proxyArr.forEach(proxy => {
            proxy.test.cancel()
            proxy.status = ''
          })

          dispatch(updateProxiesTest(id, proxyArr))
          dispatch(startProxiesTest(undefined))
        })

        // start tests
        await async.parallelLimit(tests, testLimit)

        dispatch(startProxiesTest(undefined))
        resolve()
      }),
    ),
  )
}

export const testProxy = (id, testProxy) => async (dispatch, getState) => {
  const { proxies } = getState()

  const proxy = proxies.groups.find(group => group.id === id)?.proxies.find(comparer(testProxy))
  if (!proxy) throw new Error(`Group or proxy doesn't exist.`)

  if (proxy.test && proxy.test.isPending()) return

  proxy.status = 'Testing'
  proxy.speed = undefined
  dispatch(updateProxiesTest(id, [proxy]))

  try {
    proxy.test = test(proxy)
    dispatch(updateProxiesTest(id, [proxy]))
    proxy.speed = await proxy.test
    proxy.status = 'Online'
  } catch (err) {
    proxy.status = 'Offline'
    proxy.speed = undefined
  }

  dispatch(updateProxiesTest(id, [proxy]))
}

export const cancelTestProxy = (id, testProxy) => (dispatch, getState) => {
  const { proxies } = getState()

  const proxy = proxies.groups.find(group => group.id === id)?.proxies.find(comparer(testProxy))
  if (!proxy) throw new Error(`Group or proxy doesn't exist.`)

  if (!proxy.test || !proxy.test.isPending()) return

  proxy.test.cancel()
  proxy.status = ''

  dispatch(updateProxiesTest(id, [proxy]))
}

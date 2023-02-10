import React, { useState, useEffect, useRef } from 'react'
import './windowControls.scss'
import './solver.scss'
import colors from './colors.module.scss'

import { Test, Refresh, Plus, Import, Export, Trash } from './icons'
import { Checkbox } from 'react-input-checkbox'

import Select from './select'
import TernaryButton from './button'
import { proxyPatternNonGlobal as proxyPattern } from './validation'

const {
  windowControls: { minimize, hide },
  solver: { createNewGoogleAccountSession, createNewSolverWindow, createNewSatelliteSolver, returnSatelliteSolver, deleteSolver, deleteSession, rotateProxy, updateSession, importSessions, importSolvers, exportSessions, exportSolvers, exportWindows, testSolver, refreshSolver, setFrontSolver },
  store,
} = window

export default () => {
  const [state, setState] = useState({
      solvers: [],
      sessions: [],
      windows: [],
      activeSolver: 0,
      defaultSessionId: undefined,
      type: undefined,
      windowId: undefined,
    }),
    [proxyInput, setProxyInput] = useState(''),
    [proxyButton, setProxyButton] = useState(null),
    [selectIsLoading, setSelectIsLoading] = useState(false),
    refState = useRef(state)

  const currentActiveSolver = state.solvers.filter(({ windowId }) => windowId === state.windowId)[state.activeSolver]

  const sessionOptions = state.sessions.filter(({ name }) => name).map(({ name, id }) => ({ label: name, value: id }))
  sessionOptions.unshift({ label: state.solvers.length > 0 ? 'Default Session' : '', value: currentActiveSolver?.originalSessionId || '' })

  const handleProxyChange = async () => {
    const solverId = currentActiveSolver.id

    if (!proxyInput.length) {
        await rotateProxy({solverId, proxy: undefined})
    } else {
        let match
        if ((match = proxyInput.match(proxyPattern))) {
            await rotateProxy({solverId, proxy: {...match.groups}})
        } else {
            setProxyInput('')
            await rotateProxy({solverId, proxy: undefined})
        }
    }

    setProxyButton(null)

    // if (!proxyButton) {
    //   let match
    //   if ((match = proxyInput.match(proxyPattern))) {
    //     setProxyButton(undefined)
    //     await rotateProxy({ solverId, proxy: { ...match.groups } })
    //   } else {
    //     const { proxy } = currentActiveSolver
    //     if (proxy) {
    //       const { host, port, username, password, auth } = proxy
    //       setProxyInput(`${host}:${port}${auth ? `:${username}:${password}` : ''}`)
    //     } else setProxyInput('')
    //   }
    // } else {
    //   await rotateProxy({ solverId, proxy: undefined })
    //   setProxyButton(!proxyButton)
    // }

    const solvers = await exportSolvers()
    const sessions = await exportSessions()
    setState({ ...state, solvers, sessions })
    store.set('captcha', { sessions, solvers })
  }

  const handleDeleteSession = async () => {
    if (currentActiveSolver.sessionId === currentActiveSolver.originalSessionId) return
    try {
      const solverId = currentActiveSolver.id
      const sessionId = currentActiveSolver.sessionId
      await deleteSession({ solverId, sessionId })

      const solvers = await exportSolvers()
      const sessions = await exportSessions()

      setState({ ...state, solvers, sessions, windows })
      store.set('captcha', { sessions, solvers })
    } catch (err) {
      console.error('Unable to delete session.')
    }
  }

  const handleCreateSession = async name => {
    const solverId = currentActiveSolver.id

    setSelectIsLoading(true)

    // Try catch in case user cancels the google account session, to revert select loading state to false
    try {
      await createNewGoogleAccountSession({ solverId, name })

      const solvers = await exportSolvers()
      const sessions = await exportSessions()
      const windows = await exportWindows()

      setState({ ...refState.current, solvers, sessions, windows })      
      store.set('captcha', { sessions, solvers })
    } catch (err) {
      console.error(err.message)
    }

    setSelectIsLoading(false)
  }

  const handleSessionChange = async ({ value }) => {
    const solverId = currentActiveSolver.id
    const sessionId = value
    
    setSelectIsLoading(true)

    // Try catch in case user cancels the update session, to revert select loading state to false
    try {
      await updateSession({ solverId, sessionId })

      const solvers = await exportSolvers()
      const sessions = await exportSessions()

      setState({ ...refState.current, solvers, sessions })
      store.set('captcha', { sessions, solvers })
    } catch (err) {
      console.error(err.message)
    }

    setSelectIsLoading(false)
  }

  const handleNewSolverWindow = async () => {
    await createNewSolverWindow({ proxy: undefined, autoClickCaptcha: true })
    const solvers = await exportSolvers()
    const sessions = await exportSessions()
    const windows = await exportWindows()

    setState({ ...state, solvers, sessions, windows, activeSolver: solvers.filter(({ windowId }) => windowId === state.windowId).length - 1 })
    store.set('captcha', { sessions, solvers })
  }

  const handleNewSatellite = async () => {
    await createNewSatelliteSolver({ solverId: currentActiveSolver.id })

    const solvers = await exportSolvers()
    const sessions = await exportSessions()
    const windows = await exportWindows()

    setState({ ...state, solvers, sessions, windows, activeSolver: 0 })
  }

  const handleSolverTest = async () => {
    const solvers = await exportSolvers()
    const solverId = solvers.filter(({ windowId }) => windowId === state.windowId)[state.activeSolver].id
    await testSolver({ solverId })  
  }

  const handleSolverRefresh = async () => {
    const solvers = await exportSolvers()
    const solverId = solvers.filter(({ windowId }) => windowId === state.windowId)[state.activeSolver].id
    await refreshSolver({ solverId })
  } 

  const handleSatelliteImport = async () => {
    await returnSatelliteSolver({ solverId: state.solvers.filter(({ windowId }) => windowId === state.windowId)[0].id })
  }

  const handleProxyInputChange = async e => {
    setProxyInput(e.target.value)
    if (!e.target.value.length || e.target.value.match(proxyPattern)) setProxyButton(true)
    else setProxyButton(false)
  }

  const handleDeleteSolver = async solverId => {
    try {
      await deleteSolver({ solverId })

      const solvers = await exportSolvers()
      const sessions = await exportSessions()
      const windows = await exportWindows()

      setState({ ...refState.current, activeSolver: 0, solvers, sessions, windows })
      store.set('captcha', { sessions, solvers })
    } catch (err) {
      console.error(err.message)
    }
  }

  useEffect(() => {
    refState.current = state
  }, [state])

  /**
   * Listen for window event from Captcha Solver
   */
  useEffect(() => {
    window.onmessage = async event => {
      if (event.source !== window) return

      switch (event.data.action) {
        case 'solverWindowType':
          setState({
            ...refState.current,
            type: event.data.type,
            windowId: event.data.id,
          })
          break
        case 'updateWindow':
          {
            const solvers = await exportSolvers()
            const sessions = await exportSessions()
            const windows = await exportWindows()

            setState({ ...refState.current, solvers, sessions, windows })
            store.set('captcha', { sessions, solvers })
          }
          break
        case 'focusTab':
          {
            const activeSolver = refState.current.solvers.filter(({ windowId }) => windowId === refState.current.windowId)?.findIndex(({ id }) => id === event.data.id)

            if (activeSolver && activeSolver >= 0) {
              const solvers = await exportSolvers()
              const sessions = await exportSessions()
              const windows = await exportWindows()

              setState({
                ...refState.current,
                solvers,
                sessions,
                windows,
                activeSolver,
              })
            }
          }
          break
        default:
          break
      }
    }
  }, [])

  /**
   * Trigger to bring solver to front when activeSolver changes
   */
  useEffect(async () => {
    if (refState.current.windowId) {
      const solver = refState.current.solvers.filter(({ windowId }) => windowId === refState.current.windowId)[refState.current.activeSolver]
      console.log('solver', solver)

      setFrontSolver({ solverId: solver.id })
      setProxyInput(solver.proxy ? `${solver.proxy.host}:${solver.proxy.port}${solver.proxy.auth ? `:${solver.proxy.username}:${solver.proxy.password}` : ''}` : '')
      setProxyButton(null)
    }
  }, [state.activeSolver])

  /**
   * Trigger state update once window event received
   */
  useEffect(async () => {
    if (refState.current.type === 'main') {
      const _ = store.get('captcha')

      if (_.solvers.length === 0) {
        await createNewSolverWindow({ proxy: undefined, autoClickCaptcha: true })
      } else {
        // console.log('importing sessions', _.sessions)
        await importSessions({ sessions: _.sessions })

        // console.log('importing solvers', _.solvers)
        await importSolvers({ solvers: _.solvers })
      }
    } else if (refState.current.type !== 'satellite') return

    const solvers = await exportSolvers()
    const sessions = await exportSessions()
    const windows = await exportWindows()

    // console.log('windowId', refState.current.windowId)
    // console.log('solvers', solvers)
    // console.log('sessions', sessions)
    // console.log('windows', windows)

    store.set('captcha', { sessions, solvers }) 
    setState({ ...refState.current, solvers, sessions, windows, activeSolver: 0 })
    setFrontSolver({ solverId: solvers.filter(({ windowId }) => windowId === refState.current.windowId)[0].id })

    const { proxy } = solvers.filter(({ windowId }) => windowId === refState.current.windowId)[0]
    if (proxy) {
      const { host, port, username, password, auth } = proxy
      setProxyInput(`${host}:${port}${auth ? `:${username}:${password}` : ''}`)
      setProxyButton(null)
    } else setProxyInput('')
  }, [state.type])

  /**
   * Show loading screen if type hasn't been set
   */
  if (!state.type) {
    return (
      <>
        <header>
          <div style={{ marginLeft: '4px' }}>Captcha Solver</div>
          <div className="window-controls">
            <div className="min" onClick={minimize}>
              _
            </div>
            <div className="exit" onClick={hide}>
              X
            </div>
          </div>
        </header>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '640px', width: '100%' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="286.91px" height="286.91px" viewBox="0 0 286.91 286.91">
            <path
              id="spinner"
              fill="#D1AAFF"
              d="M143.46,0C105.3,0,69.32,14.97,42.15,42.15C14.97,69.32,0,105.3,0,143.46c0,38.15,14.97,74.13,42.15,101.31
		c27.18,27.18,63.16,42.15,101.31,42.15c1.56,0,2.87-1.32,2.87-2.87s-1.32-2.87-2.87-2.87c-75.93,0-137.71-61.78-137.71-137.71
		S67.52,5.74,143.46,5.74s137.71,61.78,137.71,137.71c0,1.56,1.32,2.87,2.87,2.87s2.87-1.32,2.87-2.87
		c0-38.15-14.97-74.13-42.15-101.31S181.61,0,143.46,0z">
              <animateTransform attributeType="xml" attributeName="transform" type="rotate" from="0 143.455 143.455" to="360 143.455 143.455" dur="2s" repeatCount="indefinite" />
            </path>
          </svg>
          <span style={{ position: 'absolute', fontSize: '18px', fontFamily: "'Alt Regular', sans-serif" }}>Loading</span>
        </div>
      </>
    )
  }

  return (
    <>
      <header>
        <div className="window-controls">
          {state.type === 'main' && state.solvers.some(({ windowId }) => windowId === state.windowId) && (
            <div className="export">
              <Export height="15" width="15" onClick={handleNewSatellite} />
            </div>
          )}
        </div>
        <div style={{ marginLeft: '4px' }}>Captcha Solver</div>
        <div className="window-controls">
          {state.type === 'main' && (
            <div className="plus">
              <Plus height="12" width="12" onClick={handleNewSolverWindow} />
            </div>
          )}

          <div className="test">
            <Test
              height="12"
              width="12"
              onClick={handleSolverTest}
            />
          </div>
          <div className="refresh">
            <Refresh
              height="12"
              width="12"
              onClick={handleSolverRefresh}
            />
          </div>
          <div className="min" onClick={minimize}>
            _
          </div>
          {state.type === 'main' ? (
            <div className="exit" onClick={hide}>
              X
            </div>
          ) : (
            state.type === 'satellite' && (
              <div className="import">
                <Import
                  height="15"
                  width="15"
                  onClick={handleSatelliteImport}
                />
              </div>
            )
          )}
        </div>
      </header>
      <div className="tabs">
        {state.solvers &&
          state.solvers
            .filter(({ windowId }) => windowId === state.windowId)
            .map((solver, i) => (
              <div key={solver.id} onClick={() => setState({ ...state, activeSolver: i })} className={'tab' + (state.activeSolver === i ? ' active' : '')}>
                {i + 1}
                {state.type === 'main' && state.solvers.filter(({ windowId }) => windowId === state.windowId).length > 1 && (
                  <div className="tabExit" onClick={() => handleDeleteSolver(solver.id)}>
                    X
                  </div>
                )}
              </div>
            ))}
      </div>

      <footer>
        <div className="controls">
          <div className="row">
            <div className="col">
              {/* <label htmlFor="solver_account"><small>Account</small></label> */}
              <Select
                id="solver_account"
                name="solver_account"
                placeholder="Account"
                styles={{
                  control: () => ({
                    border: 'none',
                    display: 'flex',
                    boxSizing: 'border-box',
                    width: '100%',
                    fontSize: '12px',
                    backgroundColor: colors.base01,
                    borderRadius: '4px',
                    padding: '1px 12px',
                  }),
                  menuList: styles => ({
                    ...styles,
                    maxHeight: '60px',
                  }),
                  option: (styles, { isSelected, isFocused, isDisabled }) => ({
                    ...styles,
                    fontSize: '12px',
                    padding: '3px 12px',
                    backgroundColor: !isDisabled && isSelected ? colors.base0 : isFocused ? colors.violet : undefined,
                    ':active': {
                      ...styles[':active'],
                      backgroundColor: !isDisabled && (!isSelected ? colors.blurple : undefined),
                    },
                  }),
                }}
                options={sessionOptions}
                creatable
                isLoading={selectIsLoading}
                value={state.solvers.filter(({ windowId }) => windowId === state.windowId).length > 0 ? sessionOptions[sessionOptions.findIndex(({ value }) => value === currentActiveSolver.sessionId)] : sessionOptions[0]}
                onChange={handleSessionChange}
                onCreateOption={handleCreateSession}
              />
            </div>
            <div className="col-1" style={{ width: '20px', paddingLeft: '8px', margin: 'auto' }}>
              <Trash className={currentActiveSolver?.sessionId === currentActiveSolver?.originalSessionId || state.solvers.filter(({sessionId}) => sessionId === currentActiveSolver.sessionId).length > 1 && 'disabled'} height="18" width="18" onClick={handleDeleteSession} />
            </div>
          </div>
          <div className="row">
            <div className="col group">
              <input id="solver_proxy" name="solver_proxy" type="text" placeholder="No Proxy" value={proxyInput} onInput={handleProxyInputChange} />
            </div>
            <div className="col-1" style={{ width: '20px', paddingLeft: '8px', margin: 'auto' }}>
              <TernaryButton value={proxyButton} onClick={handleProxyChange}></TernaryButton>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}

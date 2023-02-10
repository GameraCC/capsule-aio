const store = window.store

const initialState = {
  ...store.get('bind'),
}

export default (
  state = {
    ...initialState,
  },
  action,
) => {
  switch (action.type) {
    default:
      return state
  }
}

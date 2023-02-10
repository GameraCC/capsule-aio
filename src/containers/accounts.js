import { connect } from 'react-redux'

import Accounts from '../components/accounts'

import {
  accountsGroupSetActive,
  accountsGroupCreateOpen,
  accountsGroupCreateClose,
  accountsGroupDeleteOpen,
  accountsGroupDeleteClose,
  accountsAddOpen,
  accountsAddClose,
} from '../actions/app'

import {
  addAccounts,
  deleteAccounts,
  saveNewAccountsGroup,
  deleteAccountsGroup,
} from '../actions/accounts'

const mapStateToProps = ({
  app: {
    activeScreen,
    accounts: { activeGroup },
    accountsGroupCreate,
    accountsGroupDelete,
    accountsAdd,
  },
  accounts,
}) => ({
  activeScreen,
  activeGroup,
  accounts,
  accountsGroupCreate,
  accountsGroupDelete,
  accountsAdd,
})

const mapDispatchToProps = dispatch => ({
  setActiveGroup: id => dispatch(accountsGroupSetActive(id)),
  deleteAccounts: (id, accounts) => dispatch(deleteAccounts(id, accounts)),
  accountsGroupCreate: {
    open: () => dispatch(accountsGroupCreateOpen()),
    close: () => dispatch(accountsGroupCreateClose()),
    submit: groupName => dispatch(saveNewAccountsGroup(groupName)),
  },
  accountsGroupDelete: {
    open: () => dispatch(accountsGroupDeleteOpen()),
    close: () => dispatch(accountsGroupDeleteClose()),
    submit: id => dispatch(deleteAccountsGroup(id)),
  },
  accountsAdd: {
    open: () => dispatch(accountsAddOpen()),
    close: () => dispatch(accountsAddClose()),
    submit: (id, accounts) => dispatch(addAccounts(id, accounts)),
  },
})

const mergeProps = (propsFromState, propsFromDispatch, ownProps) => ({
  ...propsFromState,
  ...propsFromDispatch,
  ...ownProps,
  accountsGroupCreate: {
    ...propsFromDispatch.accountsGroupCreate,
    ...propsFromState.accountsGroupCreate,
  },
  accountsGroupDelete: {
    ...propsFromDispatch.accountsGroupDelete,
    ...propsFromState.accountsGroupDelete,
  },
  accountsAdd: {
    ...propsFromDispatch.accountsAdd,
    ...propsFromState.accountsAdd,
  },
})

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(Accounts)

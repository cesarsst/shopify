import {
  USER_WALLET_LOGIN,
  GET_STORE_CONTRACT
} from '../constants/storeConstants'

export const userWalletConnectReducer = (state = {
  walletInfo: null
}, action) => {
  switch (action.type) {
    case USER_WALLET_LOGIN:
      return { walletInfo: { address: action.payload } };
    default:
      return state
  }
}

export const contractReducer = (
  state = { storeContract: null },
  action
) => {
  switch (action.type) {
    case GET_STORE_CONTRACT:
      return { storeContract: action.payload.contract, owner: action.payload.owner, ethValue: action.payload.ethValue, valueInContract: action.payload.valueInContract }
    default:
      return state
  }
}

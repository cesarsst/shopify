import web3 from '../web3';
import StoreInterface from '../abi/Store.json';
import { USER_WALLET_LOGIN, GET_STORE_CONTRACT } from '../constants/storeConstants'

const getContract = async (abi, address) => {
 return new web3.eth.Contract(abi, address);
};

export const initializeStoreContract = () => async (dispatch) => {
 try {
  if (window.ethereum) {
   const contractInstance = await getContract(StoreInterface.abi, StoreInterface.address);
   const owner = await contractInstance.methods.owner().call();

   console.log("Store contract owner:", owner)
   const contractEthValue = await contractInstance.methods.ethValue().call();
   const ethValue = parseInt(contractEthValue);
   console.log("ethValue:", ethValue)

   let balance = await web3.eth.getBalance(contractInstance.options.address); //Will give value in.
   balance = parseInt(balance);
   balance = web3.utils.fromWei(String(balance), 'ether');

   dispatch({
    type: GET_STORE_CONTRACT,
    payload: {
     contract: contractInstance,
     owner: owner,
     ethValue: ethValue,
     valueInContract: balance
    },
   })
  } else {
   console.log('Please install MetaMask!');
  }
 } catch (error) {
  console.log(error);
  // dispatch({
  //   type: 'WALLET_CONNECT_FAIL',
  //   payload: error.message,
  // });
 }
};

export const walletLogin = () => async (dispatch) => {
 try {
  if (window.ethereum) {
   const accounts = await web3.eth.requestAccounts();
   const walletAddress = accounts[0];

   dispatch({
    type: USER_WALLET_LOGIN,
    payload: walletAddress,
   });
  } else {
   console.log('Please install MetaMask!');
  }
 } catch (error) {
  console.log(error);
  // dispatch({
  //   type: 'WALLET_CONNECT_FAIL',
  //   payload: error.message,
  // });
 }
};

export const walletLogout = () => async (dispatch) => {
 try {
  dispatch({
   type: USER_WALLET_LOGIN,
   payload: null,
  });


 } catch (error) {
  console.log(error);
  // dispatch({
  //   type: 'WALLET_CONNECT_FAIL',
  //   payload: error.message,
  // });
 }
};



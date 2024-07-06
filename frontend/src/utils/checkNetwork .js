import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';

const TARGET_NETWORK_ID = '0x7A69'; // Mainnet (você pode alterar para outra rede, como Ropsten: '0x3', Rinkeby: '0x4', etc.)

const checkNetwork = async () => {
 const provider = await detectEthereumProvider();

 if (provider) {
  const web3 = new Web3(provider);
  const networkId = await web3.eth.net.getId();

  if (networkId !== parseInt(TARGET_NETWORK_ID, 16)) {
   try {
    await provider.request({
     method: 'wallet_switchEthereumChain',
     params: [{ chainId: TARGET_NETWORK_ID }],
    });
   } catch (switchError) {
    // Este erro pode ocorrer se o usuário rejeitar a solicitação ou se a rede solicitada não estiver disponível
    console.error(switchError);
    if (switchError.code === 4902) {
     // Esta rede não está disponível na MetaMask, então adicione-a
     try {
      await provider.request({
       method: 'wallet_addEthereumChain',
       params: [
        {
         chainId: TARGET_NETWORK_ID,
         chainName: 'Ethereum Mainnet',
         rpcUrls: ['https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID'], // Substitua pelo seu RPC URL
         nativeCurrency: {
          name: 'Ether',
          symbol: 'ETH',
          decimals: 18,
         },
         blockExplorerUrls: ['https://etherscan.io'],
        },
       ],
      });
     } catch (addError) {
      console.error(addError);
     }
    }
   }
  }
 } else {
  console.error('Please install MetaMask!');
 }
};

export default checkNetwork;

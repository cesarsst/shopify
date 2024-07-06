import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys a contract named "YourContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const depoyReservation: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.
 
    When deploying to live networks (e.g `yarn deploy --network sepolia`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.
 
    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("Store", {
    from: deployer,
    // Contract constructor arguments
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });
  console.log(deployer);
  // Get the deployed contract to interact with it after deploying.
  const Store = await hre.ethers.getContract<Contract>("Store", deployer);
  const StoreAddress = await Store.getAddress();
  await Store.updateOwner('0x70997970C51812dc3A010C7d01b50e0d17dc79C8');
  console.log("👋 Initial StoreAddress:", StoreAddress);

  // Copy the ABI to the frontend so we can interact with the contract.
  const fs = require("fs");
  const path = require("path");
  const source = path.join(__dirname, "../deployments", hre.network.name, "Store.json");
  const destination = path.join(__dirname, "../../frontend/src/abi", "Store.json");
  fs.copyFileSync(source, destination);
  console.log("📝 Copied Store ABI to frontend");
};

export default depoyReservation;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
depoyReservation.tags = ["YourContract"];

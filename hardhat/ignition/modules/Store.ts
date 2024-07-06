import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// const JAN_1ST_2030 = 1893456000;
// const ONE_GWEI: bigint = 1_000_000_000n;

const StoreModule = buildModule("StoreModule", (m) => {
  // const unlockTime = m.getParameter("unlockTime", JAN_1ST_2030);
  // const lockedAmount = m.getParameter("lockedAmount", ONE_GWEI);

  // get the deployer account
  const deployer = m.getAccount(0);

  console.log("deployer", deployer);

  const store = m.contract("Store", [], {
    from: deployer
  });



  return { store };
});

export default StoreModule;

import {
  ANVIL_WALLET_CLIENT,
  DETERMINISTIC_DEPLOYER,
  ENTRY_POINT_CREATE_CALL,
  ENTRY_POINT_SIMULATIONS_CREATE_CALL,
  SIMPLE_ACCOUNT_FACTORY_CREATE_CALL,
} from "../constants";

const walletClient = ANVIL_WALLET_CLIENT();

(async () => {
  const entryPointHash = await walletClient.sendTransaction({
    to: DETERMINISTIC_DEPLOYER,
    data: ENTRY_POINT_CREATE_CALL,
  });

  console.log("EntryPoint deployed", entryPointHash);

  const simpleAccountFactoryHash = await walletClient.sendTransaction({
    to: DETERMINISTIC_DEPLOYER,
    data: SIMPLE_ACCOUNT_FACTORY_CREATE_CALL,
  });

  console.log("SimpleAccountFactory deployed", simpleAccountFactoryHash);

  const entryPointSimulationsHash = await walletClient.sendTransaction({
    to: DETERMINISTIC_DEPLOYER,
    data: ENTRY_POINT_SIMULATIONS_CREATE_CALL,
  });

  console.log("EntryPointSimulations deployed", entryPointSimulationsHash);
})();

import { createWalletClient, http } from "viem";
import { mnemonicToAccount } from "viem/accounts";
import { foundry } from "viem/chains";
import { DETERMINISTIC_DEPLOYER, ENTRY_POINT_CREATE_CALL, SIMPLE_ACCOUNT_FACTORY_CREATE_CALL } from "./constants";

const account = mnemonicToAccount("test test test test test test test test test test test junk");

const walletClient = createWalletClient({
  account,
  chain: foundry,
  transport: http("http://127.0.0.1:8545"),
});

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
})();

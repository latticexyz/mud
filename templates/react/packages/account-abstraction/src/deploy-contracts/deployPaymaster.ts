import {
  Account,
  Chain,
  Client,
  Transport,
  WalletClient,
  getContract,
  getContractAddress,
  parseEther,
  slice,
} from "viem";
import { DETERMINISTIC_DEPLOYER, VERIFYING_PAYMASTER_CALL, VERIFYING_PAYMASTER_V07_ABI } from "../constants";
import { ENTRYPOINT_ADDRESS_V07 } from "permissionless/utils";
import { getBytecode } from "viem/actions";

const waitForEntryPointDeployment = async (client: Client) => {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const code = getBytecode(client, { address: ENTRYPOINT_ADDRESS_V07 });

    if (code !== undefined) {
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
};

export const deployVerifyingPaymaster = async (walletClient: WalletClient<Transport, Chain, Account>) => {
  await waitForEntryPointDeployment(walletClient);
  const data = VERIFYING_PAYMASTER_CALL(walletClient.account.address);

  const verifyingPaymasterHash = await walletClient.sendTransaction({
    to: DETERMINISTIC_DEPLOYER,
    data,
  });

  console.log("VerifyingPaymaster deployed", verifyingPaymasterHash);

  const address = getContractAddress({
    opcode: "CREATE2",
    from: DETERMINISTIC_DEPLOYER,
    salt: slice(data, 0, 32),
    bytecode: slice(data, 32),
  });

  const verifyingPaymaster = getContract({
    address,
    abi: VERIFYING_PAYMASTER_V07_ABI,
    client: walletClient,
  });

  const depositHash = await verifyingPaymaster.write.deposit({
    value: parseEther("50"),
  });

  console.log("VerifyingPaymaster funded", depositHash);

  return verifyingPaymaster;
};

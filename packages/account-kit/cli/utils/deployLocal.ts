import { Address, Hex, createWalletClient, http, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { foundry } from "viem/chains";

// Anvil dev private key #7, automatically funded when running `anvil`
export const devPrivateKey = "0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356";
const account = privateKeyToAccount(devPrivateKey);

export const deployerClient = createWalletClient({
  account,
  chain: foundry,
  transport: http("http://127.0.0.1:8545"),
}).extend(publicActions);

export const deterministicDeployer: Address = "0x4e59b44847b379578588920ca78fbf26c0b4956c";

export async function deployLocal(data: Hex, expectedAddress: Address) {
  // Skip deployment if the contract at this address already exists
  const bytecodeBefore = await deployerClient.getBytecode({
    address: expectedAddress,
  });
  if (bytecodeBefore && bytecodeBefore !== "0x") {
    console.log("Skipping deployment of contract", expectedAddress);
    return;
  }

  // Deploy the contract
  const hash = await deployerClient.sendTransaction({
    to: deterministicDeployer,
    data,
  });
  const receipt = await deployerClient.waitForTransactionReceipt({ hash, confirmations: 0 });

  // Ensure the contract was deployed to the expected address
  const bytecodeAfter = await deployerClient.getBytecode({
    address: expectedAddress,
  });
  if (!bytecodeAfter || bytecodeAfter === "0x") {
    throw new Error("Contract not deployed at the expected address");
  }

  return receipt;
}

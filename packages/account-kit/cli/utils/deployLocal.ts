import { Address, Hex, createWalletClient, http, publicActions } from "viem";
import { mnemonicToAccount } from "viem/accounts";
import { foundry } from "viem/chains";

// Anvil dev mnemonic, automatically funded when running `anvil`
const account = mnemonicToAccount("test test test test test test test test test test test junk", { addressIndex: 7 });

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

import { Account, Chain, Client, Transport } from "viem";
import { getBytecode, sendRawTransaction, sendTransaction, waitForTransactionReceipt } from "viem/actions";
import deployment from "./create2/deployment.json";
import { debug } from "./debug";

export const deployer = `0x${deployment.address}` as const;

export async function ensureDeployer(client: Client<Transport, Chain | undefined, Account>): Promise<void> {
  const bytecode = await getBytecode(client, { address: deployer });
  if (bytecode) {
    debug("found create2 deployer at", deployer);
    return;
  }

  // send gas to signer
  debug("sending gas for create2 deployer to signer at", deployment.signerAddress);
  const gasTx = await sendTransaction(client, {
    chain: client.chain ?? null,
    to: `0x${deployment.signerAddress}`,
    value: BigInt(deployment.gasLimit) * BigInt(deployment.gasPrice),
  });
  const gasReceipt = await waitForTransactionReceipt(client, { hash: gasTx });
  if (gasReceipt.status !== "success") {
    console.error("failed to send gas to deployer signer", gasReceipt);
    throw new Error("failed to send gas to deployer signer");
  }

  // deploy the deployer
  debug("deploying create2 deployer at", deployer);
  const deployTx = await sendRawTransaction(client, { serializedTransaction: `0x${deployment.transaction}` });
  const deployReceipt = await waitForTransactionReceipt(client, { hash: deployTx });
  if (deployReceipt.contractAddress !== deployer) {
    console.error("unexpected contract address for deployer", deployReceipt);
    throw new Error("unexpected contract address for deployer");
  }
}

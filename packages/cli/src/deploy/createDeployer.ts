import { Account, Address, Chain, Client, Transport } from "viem";
import { getBytecode, sendRawTransaction, sendTransaction, waitForTransactionReceipt } from "viem/actions";
import { deployer } from "./common";
import deployment from "./deterministic-deployment-proxy/deployment.json";

export async function createDeployer({
  client,
}: {
  client: Client<Transport, Chain | undefined, Account>;
}): Promise<Address> {
  const bytecode = await getBytecode(client, { address: deployer });

  if (!bytecode) {
    // send gas to signer
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
    const deployTx = await sendRawTransaction(client, { serializedTransaction: `0x${deployment.transaction}` });
    const deployReceipt = await waitForTransactionReceipt(client, { hash: deployTx });
    if (deployReceipt.contractAddress !== deployer) {
      console.error("unexpected contract address for deployer", deployReceipt);
      throw new Error("unexpected contract address for deployer");
    }
  }

  return deployer;
}

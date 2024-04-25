import { Account, Address, Chain, Client, Transport } from "viem";
import { getBalance, sendRawTransaction, sendTransaction, waitForTransactionReceipt } from "viem/actions";
import deployment from "./create2/deployment.json";
import { debug } from "./debug";
import { getDeployer } from "./getDeployer";

const deployer = `0x${deployment.address}` as const;

export async function ensureDeployer(client: Client<Transport, Chain | undefined, Account>): Promise<Address> {
  const existingDeployer = await getDeployer(client);
  if (existingDeployer !== undefined) {
    return existingDeployer;
  }

  // There's not really a way to simulate a pre-EIP-155 (no chain ID) transaction,
  // so we have to attempt to create the deployer first and, if it fails, fall back
  // to a regular deploy.

  // Send gas to deployment signer
  const gasRequired = BigInt(deployment.gasLimit) * BigInt(deployment.gasPrice);
  const currentBalance = await getBalance(client, { address: `0x${deployment.signerAddress}` });
  const gasNeeded = gasRequired - currentBalance;
  if (gasNeeded > 0) {
    debug("sending gas for CREATE2 deployer to signer at", deployment.signerAddress);
    const gasTx = await sendTransaction(client, {
      chain: client.chain ?? null,
      to: `0x${deployment.signerAddress}`,
      value: gasNeeded,
    });
    const gasReceipt = await waitForTransactionReceipt(client, { hash: gasTx });
    if (gasReceipt.status !== "success") {
      console.error("failed to send gas to deployer signer", gasReceipt);
      throw new Error("failed to send gas to deployer signer");
    }
  }

  // Deploy the deployer
  debug("deploying CREATE2 deployer at", deployer);
  const deployTx = await sendRawTransaction(client, { serializedTransaction: `0x${deployment.transaction}` }).catch(
    (error) => {
      // Do a regular contract create if the presigned transaction doesn't work due to replay protection
      if (String(error).includes("only replay-protected (EIP-155) transactions allowed over RPC")) {
        console.warn(
          // eslint-disable-next-line max-len
          `\n  ⚠️ Your chain or RPC does not allow for non EIP-155 signed transactions, so your deploys will not be determinstic and contract addresses may change between deploys.\n\n  We recommend running your chain's node with \`--rpc.allow-unprotected-txs\` to enable determinstic deployments.\n`,
        );
        debug("deploying CREATE2 deployer");
        return sendTransaction(client, {
          chain: client.chain ?? null,
          data: `0x${deployment.creationCode}`,
        });
      }
      throw error;
    },
  );

  const deployReceipt = await waitForTransactionReceipt(client, { hash: deployTx });
  if (!deployReceipt.contractAddress) {
    throw new Error("Deploy receipt did not have contract address, was the deployer not deployed?");
  }

  if (deployReceipt.contractAddress !== deployer) {
    console.warn(
      `\n  ⚠️ CREATE2 deployer created at ${deployReceipt.contractAddress} does not match the CREATE2 determinstic deployer we expected (${deployer})`,
    );
  }

  return deployReceipt.contractAddress;
}

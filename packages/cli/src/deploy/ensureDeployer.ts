import { Account, Address, Chain, Client, Transport, getCreateAddress } from "viem";
import {
  getBytecode,
  getTransactionReceipt,
  sendRawTransaction,
  sendTransaction,
  waitForTransactionReceipt,
} from "viem/actions";
import deployment from "./create2/deployment.json";
import customDeployment from "./create2/customDeployment.json";
import { debug } from "./debug";
import { Hex } from "viem";

export const deployerObj = {
  deployer: "0x" as Hex,
};

export async function ensureDeployer(
  client: Client<Transport, Chain | undefined, Account>,
  customDeployer?: Address
): Promise<void> {
  let deployer: Address;

  try {
    if (customDeployer) {
      deployer = await ensureExistDeployer(client, customDeployer);
    } else {
      deployer = await ensureExistDeployer(client, `0x${deployment.address}` as Address);
    }
  } catch (e) {
    debug("use existing deployer fail, try to deploy an custom deployer");

    deployer = await ensureIndependentDeployer(client, customDeployer);
  }

  debug(`using ${deployer} as create2 deployer`);
  deployerObj.deployer = deployer;
}

async function ensureExistDeployer(
  client: Client<Transport, Chain | undefined, Account>,
  deployer: Address
): Promise<Address> {
  const bytecode = await getBytecode(client, { address: deployer });
  if (bytecode) {
    debug("found create2 deployer at", deployer);
    return deployer;
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

  return deployer;
}

async function ensureIndependentDeployer(
  client: Client<Transport, Chain | undefined, Account>,
  customDeployer?: Address
): Promise<Address> {
  if (customDeployer) {
    const bytecode = await getBytecode(client, { address: customDeployer });
    if (bytecode) {
      debug("found create2 deployer at", customDeployer);
      return customDeployer;
    }
  }

  const tx = await sendTransaction(client, {
    chain: client.chain ?? null,
    data: customDeployment.data as Hex,
  });

  const receipt = await getTransactionReceipt(client, { hash: tx });

  if (!receipt.contractAddress) {
    throw new Error("deploy custom deployer fails");
  }

  debug(`deploy custom create2 deployer at ${receipt.contractAddress}, please config it manually for contract upgrade`);

  return receipt.contractAddress;
}

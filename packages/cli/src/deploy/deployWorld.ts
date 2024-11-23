import { Account, Chain, Client, Hex, Transport, parseEventLogs } from "viem";
import { waitForTransactionReceipt, writeContract } from "viem/actions";
import { ensureWorldFactory } from "./ensureWorldFactory";
import WorldFactoryAbi from "@latticexyz/world/out/WorldFactory.sol/WorldFactory.abi.json" assert { type: "json" };
import { debug } from "./debug";
import { logsToWorldDeploy } from "./logsToWorldDeploy";
import { WorldDeploy } from "./common";
import { getAction } from "viem/utils";
import { entryPoint07Abi } from "viem/account-abstraction";

export async function deployWorld(
  client: Client<Transport, Chain | undefined, Account>,
  deployerAddress: Hex,
  salt: Hex,
  withWorldProxy?: boolean,
): Promise<WorldDeploy> {
  const worldFactory = await ensureWorldFactory(client, deployerAddress, withWorldProxy);

  debug("deploying world");
  const tx = await getAction(
    client,
    writeContract,
    "writeContract",
  )({
    chain: client.chain ?? null,
    account: client.account,
    address: worldFactory,
    abi: WorldFactoryAbi,
    functionName: "deployWorld",
    args: [salt],
  });

  debug("waiting for world deploy at tx", tx);
  const receipt = await getAction(client, waitForTransactionReceipt, "waitForTransactionReceipt")({ hash: tx });
  if (receipt.status !== "success") {
    console.error("world deploy failed", receipt);
    throw new Error("world deploy failed");
  } else if (client.account.type === "smart") {
    // TODO: lift this out into something better that doesn't assume one tx
    const parsedLogs = parseEventLogs({
      logs: receipt.logs,
      abi: entryPoint07Abi,
      eventName: "UserOperationEvent" as const,
    });
    if (!parsedLogs[0].args.success) {
      console.error("world deploy failed");
      throw new Error("world deploy failed");
    }
  }

  const deploy = logsToWorldDeploy(receipt.logs);
  debug("deployed world to", deploy.address, "at block", deploy.deployBlock);

  return { ...deploy, stateBlock: deploy.deployBlock };
}

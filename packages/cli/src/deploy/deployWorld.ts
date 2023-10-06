import {
  AbiEventSignatureNotFoundError,
  Account,
  Address,
  Chain,
  Client,
  Log,
  Transport,
  decodeEventLog,
  formatLog,
} from "viem";
import { waitForTransactionReceipt } from "viem/actions";
import { ensureWorldFactory, worldFactory } from "./ensureWorldFactory";
import WorldFactoryAbi from "@latticexyz/world/out/WorldFactory.sol/WorldFactory.abi.json" assert { type: "json" };
import { writeContract } from "@latticexyz/common";
import { debug } from "./debug";
import { logsToWorldDeploy } from "./logsToWorldDeploy";
import { WorldDeploy } from "./common";

export async function deployWorld(client: Client<Transport, Chain | undefined, Account>): Promise<WorldDeploy> {
  await ensureWorldFactory(client);

  debug("deploying world");
  const tx = await writeContract(client, {
    chain: client.chain ?? null,
    address: worldFactory,
    abi: WorldFactoryAbi,
    functionName: "deployWorld",
  });

  debug("waiting for world deploy");
  const receipt = await waitForTransactionReceipt(client, { hash: tx });
  if (receipt.status !== "success") {
    console.error("world deploy failed", receipt);
    throw new Error("world deploy failed");
  }

  // TODO: fix receipt log type in viem to not be pending
  const deploy = logsToWorldDeploy(receipt.logs.map((log) => log as Log<bigint, number, false>));
  debug("deployed world to", deploy.address, "at block", deploy.fromBlock);

  return { ...deploy, toBlock: deploy.fromBlock };
}

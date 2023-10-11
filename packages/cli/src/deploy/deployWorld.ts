import { Account, Chain, Client, Log, Transport } from "viem";
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

  // TODO: remove type casting once https://github.com/wagmi-dev/viem/pull/1330 is merged
  const deploy = logsToWorldDeploy(receipt.logs.map((log) => log as Log<bigint, number, false>));
  debug("deployed world to", deploy.address, "at block", deploy.deployBlock);

  return { ...deploy, stateBlock: deploy.deployBlock };
}

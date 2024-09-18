import { Account, Chain, Client, Hex, Transport } from "viem";
import { ensureWorldFactory } from "./ensureWorldFactory";
import WorldFactoryAbi from "@latticexyz/world/out/WorldFactory.sol/WorldFactory.abi.json" assert { type: "json" };
import { writeContract } from "@latticexyz/common";
import { debug } from "./debug";
import { logsToWorldDeploy } from "./logsToWorldDeploy";
import { WorldDeploy } from "./common";
import { waitForTransactions } from "./waitForTransactions";

export async function deployWorld(
  client: Client<Transport, Chain | undefined, Account>,
  deployerAddress: Hex,
  salt: Hex,
  withWorldProxy?: boolean,
): Promise<WorldDeploy> {
  const worldFactory = await ensureWorldFactory(client, deployerAddress, withWorldProxy);

  debug("deploying world");
  const tx = await writeContract(client, {
    chain: client.chain ?? null,
    address: worldFactory,
    abi: WorldFactoryAbi,
    functionName: "deployWorld",
    args: [salt],
  });

  const [receipt] = await waitForTransactions({ client, hashes: [tx], debugLabel: "world deploy" });
  const deploy = logsToWorldDeploy(receipt.logs);
  debug("deployed world to", deploy.address, "at block", deploy.deployBlock);

  return { ...deploy, stateBlock: deploy.deployBlock };
}

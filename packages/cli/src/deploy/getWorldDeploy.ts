import { Client, Address, getAddress, parseAbi } from "viem";
import { getLogs } from "viem/actions";
import { WorldDeploy, helloStoreEvent, helloWorldEvent } from "./common";
import { debug } from "./debug";
import { logsToWorldDeploy } from "./logsToWorldDeploy";

const deploys = new Map<Address, WorldDeploy>();

export async function getWorldDeploy(client: Client, worldAddress: Address): Promise<WorldDeploy> {
  const address = getAddress(worldAddress);

  let deploy = deploys.get(address);
  if (deploy != null) {
    return deploy;
  }

  debug("looking up world deploy for", address);
  const logs = await getLogs(client, {
    strict: true,
    address,
    events: parseAbi([helloWorldEvent, helloStoreEvent]),
    fromBlock: "earliest",
  });

  deploy = logsToWorldDeploy(logs);
  deploys.set(address, deploy);
  debug("found world deploy for", address, "at block", deploy.blockNumber);

  return deploy;
}

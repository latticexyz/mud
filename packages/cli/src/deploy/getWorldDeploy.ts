import { Client, Address, getAddress, parseAbi } from "viem";
import { getBlockNumber, getLogs } from "viem/actions";
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

  const toBlock = await getBlockNumber(client);
  const logs = await getLogs(client, {
    strict: true,
    address,
    events: parseAbi([helloWorldEvent, helloStoreEvent]),
    fromBlock: "earliest",
    toBlock,
  });

  deploy = {
    ...logsToWorldDeploy(logs),
    toBlock,
  };
  deploys.set(address, deploy);

  debug("found world deploy for", address, "at block", deploy.fromBlock);

  return deploy;
}

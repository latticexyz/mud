import { Client, Address, getAddress, parseAbi } from "viem";
import { getBlock } from "viem/actions";
import { fetchBlockLogs } from "@latticexyz/block-logs-stream";
import { WorldDeploy, worldDeployEvents } from "./common";
import { debug } from "./debug";
import { logsToWorldDeploy } from "./logsToWorldDeploy";
import { getAction } from "viem/utils";

const deploys = new Map<Address, WorldDeploy>();

export async function getWorldDeploy(client: Client, worldAddress: Address): Promise<WorldDeploy> {
  const address = getAddress(worldAddress);

  let deploy = deploys.get(address);
  if (deploy != null) {
    return {
      ...deploy,
      stateBlock: (await getAction(client, getBlock, "getBlock")({ blockTag: "latest" })).number,
    };
  }

  debug("looking up world deploy for", address);

  const [fromBlock, toBlock] = await Promise.all([
    getAction(client, getBlock, "getBlock")({ blockTag: "earliest" }),
    getAction(client, getBlock, "getBlock")({ blockTag: "latest" }),
  ]);

  const blockLogs = await fetchBlockLogs({
    publicClient: client,
    address,
    events: parseAbi(worldDeployEvents),
    fromBlock: fromBlock.number,
    toBlock: toBlock.number,
    maxBlockRange: 100_000n,
  });

  deploy = {
    ...logsToWorldDeploy(blockLogs.flatMap((block) => block.logs)),
    stateBlock: toBlock.number,
  };
  deploys.set(address, deploy);

  debug("found world deploy for", address, "at block", deploy.deployBlock);

  return deploy;
}

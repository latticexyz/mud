import { Client, Address, getAddress, parseAbi } from "viem";
import { getBlock } from "viem/actions";
import { fetchBlockLogs } from "@latticexyz/block-logs-stream";
import { WorldDeploy, worldDeployEvents } from "./common";
import { debug } from "./debug";
import { logsToWorldDeploy } from "./logsToWorldDeploy";

const deploys = new Map<Address, WorldDeploy>();

export async function getWorldDeploy(
  client: Client,
  worldAddress: Address,
  deployBlock?: bigint,
): Promise<WorldDeploy> {
  const address = getAddress(worldAddress);

  // Fetch latest block to set the range of blocks for logs retrieval.
  const stateBlock = await getBlock(client, { blockTag: "latest" });

  let deploy = deploys.get(address);
  if (deploy != null) {
    return {
      ...deploy,
      stateBlock: stateBlock.number,
    };
  }

  debug("looking up world deploy for", address);

  const [fromBlock, toBlock] = deployBlock
    ? [{ number: deployBlock }, { number: deployBlock }]
    : [await getBlock(client, { blockTag: "earliest" }), stateBlock];

  const blockLogs = await fetchBlockLogs({
    publicClient: client,
    address,
    events: parseAbi(worldDeployEvents),
    fromBlock: fromBlock.number,
    toBlock: toBlock.number,
    maxBlockRange: 100_000n,
  });

  if (blockLogs.length === 0) {
    throw new Error("could not find `HelloWorld` or `HelloStore` event");
  }

  deploy = {
    ...logsToWorldDeploy(blockLogs.flatMap((block) => block.logs)),
    stateBlock: stateBlock.number,
  };
  deploys.set(address, deploy);

  debug("found world deploy for", address, "at block", deploy.deployBlock);

  return deploy;
}

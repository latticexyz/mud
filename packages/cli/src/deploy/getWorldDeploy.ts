import { Client, Address, getAddress, parseAbi } from "viem";
import { getBlockNumber, getLogs } from "viem/actions";
import { WorldDeploy, worldDeployEvents } from "./common";
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

  const stateBlock = await getBlockNumber(client);
  const logs = await getLogs(client, {
    strict: true,
    address,
    events: parseAbi(worldDeployEvents),
    // this may fail for certain RPC providers with block range limits
    // if so, could potentially use our fetchLogs helper (which does pagination)
    fromBlock: "earliest",
    toBlock: stateBlock,
  });

  deploy = {
    ...logsToWorldDeploy(logs),
    stateBlock,
  };
  deploys.set(address, deploy);

  debug("found world deploy for", address, "at block", deploy.deployBlock);

  return deploy;
}

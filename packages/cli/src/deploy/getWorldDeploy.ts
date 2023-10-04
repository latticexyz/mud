import { Client, Transport, Chain, Account, Address, getAddress, parseAbi, hexToString, trim } from "viem";
import { getLogs } from "viem/actions";
import { WorldDeploy } from "./common";
import { debug } from "./debug";

const deploys = new Map<Address, WorldDeploy>();

export async function getWorldDeploy(
  client: Client<Transport, Chain | undefined, Account>,
  worldAddress: Address
): Promise<WorldDeploy> {
  const address = getAddress(worldAddress);

  let deploy = deploys.get(address);
  if (deploy != null) {
    return deploy;
  }

  debug("looking up world deploy for", address);
  const logs = await getLogs(client, {
    strict: true,
    address,
    events: parseAbi([
      "event HelloWorld(bytes32 indexed worldVersion)",
      "event HelloStore(bytes32 indexed storeVersion)",
    ]),
  });

  const { blockNumber, worldVersion, storeVersion } = logs.reduce<Partial<WorldDeploy>>(
    (deploy, log) => ({
      ...deploy,
      blockNumber: log.blockNumber,
      ...(log.eventName === "HelloWorld"
        ? { worldVersion: hexToString(trim(log.args.worldVersion, { dir: "right" })) }
        : null),
      ...(log.eventName === "HelloStore"
        ? { storeVersion: hexToString(trim(log.args.storeVersion, { dir: "right" })) }
        : null),
    }),
    {}
  );

  if (blockNumber == null) throw new Error("could not find world deploy block number");
  if (worldVersion == null) throw new Error("could not find world version");
  if (storeVersion == null) throw new Error("could not find store version");

  deploy = { address, blockNumber, worldVersion, storeVersion };
  deploys.set(address, deploy);
  debug("found world deploy", deploy);

  return deploy;
}

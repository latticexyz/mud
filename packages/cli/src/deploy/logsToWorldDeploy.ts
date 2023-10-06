import { AbiEventSignatureNotFoundError, Log, decodeEventLog, hexToString, parseAbi, trim } from "viem";
import { WorldDeploy, helloStoreEvent, helloWorldEvent } from "./common";
import { isDefined } from "@latticexyz/common/utils";

export function logsToWorldDeploy(logs: readonly Log<bigint, number, false>[]): Omit<WorldDeploy, "toBlock"> {
  const deployLogs = logs
    .map((log) => {
      try {
        return {
          ...log,
          ...decodeEventLog({
            strict: true,
            abi: parseAbi([helloWorldEvent, helloStoreEvent]),
            topics: log.topics,
            data: log.data,
          }),
        };
      } catch (error: unknown) {
        if (error instanceof AbiEventSignatureNotFoundError) {
          return;
        }
        throw error;
      }
    })
    .filter(isDefined);

  // TODO: should this test for/validate that only one of each of these events is present? and that the address/block number don't change between each?
  const { address, fromBlock, worldVersion, storeVersion } = deployLogs.reduce<Partial<WorldDeploy>>(
    (deploy, log) => ({
      ...deploy,
      address: log.address,
      fromBlock: log.blockNumber,
      ...(log.eventName === "HelloWorld"
        ? { worldVersion: hexToString(trim(log.args.worldVersion, { dir: "right" })) }
        : null),
      ...(log.eventName === "HelloStore"
        ? { storeVersion: hexToString(trim(log.args.storeVersion, { dir: "right" })) }
        : null),
    }),
    {}
  );

  if (address == null) throw new Error("could not find world address");
  if (fromBlock == null) throw new Error("could not find world deploy block number");
  if (worldVersion == null) throw new Error("could not find world version");
  if (storeVersion == null) throw new Error("could not find store version");

  return { address, fromBlock, worldVersion, storeVersion };
}

import { Client, Transport, Chain, Account, Hex } from "viem";
import { hexToResource, writeContract } from "@latticexyz/common";
import { getFunctions } from "@latticexyz/world/internal";
import { WorldDeploy, WorldFunction, worldAbi } from "./common";
import { debug } from "./debug";
import pRetry from "p-retry";

export async function ensureFunctions({
  client,
  worldDeploy,
  functions,
}: {
  readonly client: Client<Transport, Chain | undefined, Account>;
  readonly worldDeploy: WorldDeploy;
  readonly functions: readonly WorldFunction[];
}): Promise<readonly Hex[]> {
  const worldFunctions = await getFunctions({
    client,
    worldAddress: worldDeploy.address,
    fromBlock: worldDeploy.deployBlock,
    toBlock: worldDeploy.stateBlock,
  });
  const worldSelectorToFunction = Object.fromEntries(worldFunctions.map((func) => [func.selector, func]));

  const toSkip = functions.filter((func) => worldSelectorToFunction[func.selector]);
  const toAdd = functions.filter((func) => !toSkip.includes(func));

  if (toSkip.length) {
    debug("functions already registered:", toSkip.map((func) => func.signature).join(", "));
    const wrongSystem = toSkip.filter((func) => func.systemId !== worldSelectorToFunction[func.selector]?.systemId);
    if (wrongSystem.length) {
      console.warn(
        "found",
        wrongSystem.length,
        "functions already registered but pointing at a different system ID:",
        wrongSystem.map((func) => func.signature).join(", "),
      );
    }
  }

  if (!toAdd.length) return [];

  debug("registering functions:", toAdd.map((func) => func.signature).join(", "));

  return Promise.all(
    toAdd.map((func) => {
      const { namespace } = hexToResource(func.systemId);

      // TODO: replace with batchCall (https://github.com/latticexyz/mud/issues/1645)
      const params =
        namespace === ""
          ? ({
              functionName: "registerRootFunctionSelector",
              args: [
                func.systemId,
                // use system function signature as world signature
                func.systemFunctionSignature,
                func.systemFunctionSignature,
              ],
            } as const)
          : ({
              functionName: "registerFunctionSelector",
              args: [func.systemId, func.systemFunctionSignature],
            } as const);

      return pRetry(
        () =>
          writeContract(client, {
            chain: client.chain ?? null,
            address: worldDeploy.address,
            abi: worldAbi,
            ...params,
          }),
        {
          retries: 3,
          onFailedAttempt: () => debug(`failed to register function ${func.signature}, retrying...`),
        },
      );
    }),
  );
}

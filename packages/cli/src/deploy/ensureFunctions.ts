import { Client, Transport, Chain, Account, Hex, encodeFunctionData } from "viem";
import { hexToResource, writeContract } from "@latticexyz/common";
import { WorldDeploy, WorldFunction, worldAbi } from "./common";
import { debug } from "./debug";
import { getFunctions } from "./getFunctions";
import pRetry from "p-retry";
import { wait } from "@latticexyz/common/utils";
import { getBatchCallData } from "../utils/getBatchCallData";

export async function ensureFunctions({
  client,
  worldDeploy,
  functions,
}: {
  readonly client: Client<Transport, Chain | undefined, Account>;
  readonly worldDeploy: WorldDeploy;
  readonly functions: readonly WorldFunction[];
}): Promise<readonly Hex[]> {
  const worldFunctions = await getFunctions({ client, worldDeploy });
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
        wrongSystem.map((func) => func.signature).join(", ")
      );
    }
  }

  if (!toAdd.length) return [];

  debug("Batch registering functions:", toAdd.map((func) => func.signature).join(", "));

  const toAddBySystem = toAdd.reduce((acc: { [key: Hex]: WorldFunction[] }, func) => {
    if (acc[func.systemId]) {
      acc[func.systemId].push(func);
    } else {
      acc[func.systemId] = [func];
    }
    return acc;
  }, {});

  const encodedFunctionDataBySystem = Object.entries(toAddBySystem).reduce((acc, [systemId, functions]) => {
    const { namespace } = hexToResource(systemId as Hex);
    const encodedFunctionDataList = functions.map((func) => {
      let encodedFunctionData: Hex;
      if (namespace === "") {
        encodedFunctionData = encodeFunctionData({
          abi: worldAbi,
          functionName: "registerRootFunctionSelector",
          args: [systemId, func.systemFunctionSignature, func.systemFunctionSelector],
        });
      } else {
        encodedFunctionData = encodeFunctionData({
          abi: worldAbi,
          functionName: "registerFunctionSelector",
          args: [systemId, func.systemFunctionSignature],
        });
      }
      return encodedFunctionData;
    });
    acc[systemId] = encodedFunctionDataList;
    return acc;
  }, {} as Record<string, Hex[]>);

  return Promise.all(
    Object.entries(encodedFunctionDataBySystem).map(([systemId, encodedFunctionData]) => {
      return pRetry(
        () =>
          writeContract(client, {
            chain: client.chain ?? null,
            address: worldDeploy.address,
            abi: worldAbi,
            functionName: "batchCall",
            args: [getBatchCallData(encodedFunctionData)],
          }),
        {
          retries: 3,
          onFailedAttempt: async (error) => {
            const delay = error.attemptNumber * 500;
            //TODO: Replace the systemId with system label
            debug(`failed to register function ${systemId}, retrying in ${delay}ms...`);
            await wait(delay);
          },
        }
      );
    })
  );
}

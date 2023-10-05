import { Client, Transport, Chain, Account, Hex, getFunctionSelector } from "viem";
import { writeContract } from "@latticexyz/common";
import { System, WorldDeploy, worldAbi } from "./common";
import { debug } from "./debug";
import { getFunctions } from "./getFunctions";

export async function ensureSystemFunctions({
  client,
  worldDeploy,
  system,
}: {
  client: Client<Transport, Chain | undefined, Account>;
  worldDeploy: WorldDeploy;
  system: System;
}): Promise<Hex[]> {
  const worldFunctions = await getFunctions({ client, worldDeploy });
  const existingSystemFunctions = worldFunctions.filter((func) => func.systemId === system.systemId);

  // TODO: figure out which system functions already exist (and are or aren't pointing to the right system ID) and which system functions to register

  debug("registering functions", system.functions.map((func) => func.signature).join(", "));

  if (system.namespace === "") {
    return await Promise.all(
      system.functions.map(({ systemFunctionSignature, systemFunctionSelector }) =>
        writeContract(client, {
          chain: client.chain ?? null,
          address: worldDeploy.address,
          abi: worldAbi,
          // TODO: replace with batchCall
          functionName: "registerRootFunctionSelector",
          // TODO: why do we have to specify the selector here?
          args: [system.systemId, systemFunctionSignature, systemFunctionSelector],
        })
      )
    );
  }

  return await Promise.all(
    system.functions.map(({ systemFunctionSignature }) =>
      writeContract(client, {
        chain: client.chain ?? null,
        address: worldDeploy.address,
        abi: worldAbi,
        // TODO: replace with batchCall
        functionName: "registerFunctionSelector",
        args: [system.systemId, systemFunctionSignature],
      })
    )
  );
}

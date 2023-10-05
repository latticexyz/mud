import { Client, Transport, Chain, Account, Hex, getFunctionSelector } from "viem";
import { writeContract } from "@latticexyz/common";
import { System, WorldDeploy, worldAbi } from "./common";
import { debug } from "./debug";

export async function ensureSystemFunctions({
  client,
  worldDeploy,
  system,
}: {
  client: Client<Transport, Chain | undefined, Account>;
  worldDeploy: WorldDeploy;
  system: System;
}): Promise<Hex[]> {
  if (system.namespace === "") {
    debug("registering root functions", system.functionSignatures.join(", "));
    return await Promise.all(
      system.functionSignatures.map((functionSignature) =>
        writeContract(client, {
          chain: client.chain ?? null,
          address: worldDeploy.address,
          abi: worldAbi,
          // TODO: replace with batchCall
          functionName: "registerRootFunctionSelector",
          args: [system.systemId, functionSignature, getFunctionSelector(functionSignature)],
        })
      )
    );
  }

  debug("registering functions", system.functionSignatures.join(", "));
  return await Promise.all(
    system.functionSignatures.map((functionSignature) =>
      writeContract(client, {
        chain: client.chain ?? null,
        address: worldDeploy.address,
        abi: worldAbi,
        // TODO: replace with batchCall
        functionName: "registerRootFunctionSelector",
        args: [system.systemId, functionSignature, getFunctionSelector(functionSignature)],
      })
    )
  );
}

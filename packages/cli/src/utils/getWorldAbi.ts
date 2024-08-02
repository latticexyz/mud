import { Abi } from "abitype";
import { getSystems } from "../deploy/getSystems";
import { functionSignatureToAbiItem } from "./functionSignatureToAbiItem";
import { Client } from "viem";
import { WorldDeploy } from "../deploy/common";

export async function getWorldAbi({
  client,
  worldDeploy,
}: {
  readonly client: Client;
  readonly worldDeploy: WorldDeploy;
}): Promise<Abi> {
  const systems = await getSystems({ client, worldDeploy });
  const worldAbi = systems.flatMap((system) =>
    system.functions.map((func) => functionSignatureToAbiItem(func.signature)),
  );

  return worldAbi;
}

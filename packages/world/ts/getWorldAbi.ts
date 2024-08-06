import { Client, Abi, Address, getAddress } from "viem";
import { getSystems } from "./getSystems";
import { functionSignatureToAbiItem } from "./functionSignatureToAbiItem";

export async function getWorldAbi({
  client,
  worldAddress,
}: {
  readonly client: Client;
  readonly worldAddress: Address;
}): Promise<Abi> {
  const formattedWorldAddress = getAddress(worldAddress);
  const systems = await getSystems({ client, worldAddress: formattedWorldAddress });

  const worldAbi = systems.flatMap((system) =>
    system.functions.map((func) => functionSignatureToAbiItem(func.signature)),
  );

  return worldAbi;
}

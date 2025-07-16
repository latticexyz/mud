import { Client, Abi, Address, hexToString, Hex, stringToHex, parseAbi } from "viem";
import metadataConfig from "@latticexyz/world-module-metadata/mud.config";
import { getRecord } from "@latticexyz/store/internal";

export async function getSystemAbi({
  client,
  worldAddress,
  systemId,
}: {
  readonly client: Client;
  readonly worldAddress: Address;
  readonly systemId: Hex;
}): Promise<Abi> {
  const record = await getRecord(client, {
    address: worldAddress,
    table: metadataConfig.tables.metadata__ResourceTag,
    key: { resource: systemId, tag: stringToHex("abi", { size: 32 }) },
  });
  const abi = parseAbi(hexToString(record.value).split("\n"));

  return abi;
}

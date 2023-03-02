import { ComponentValue } from "@latticexyz/recs";
import { Contract } from "ethers";
import { registerSchema } from "./tableSchemas";
import { getMetadata } from "./tableMetadata";
import { decodeField } from "./decodeData";

export async function decodeStoreSetField(
  contract: Contract,
  table: string,
  keyTuple: string[],
  schemaIndex: number,
  data: string
): Promise<ComponentValue> {
  const schema = await registerSchema(contract, table);
  const decoded = decodeField(schema, schemaIndex, data);

  const metadata = getMetadata(contract, table);
  if (metadata) {
    const { tableName, fieldNames } = metadata;
    return {
      ...decoded,
      [fieldNames[schemaIndex]]: decoded[schemaIndex],
    };
  }

  return decoded;
}

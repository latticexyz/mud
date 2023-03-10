import { ComponentValue } from "@latticexyz/recs";
import { TableId } from "@latticexyz/utils";
import { Contract } from "ethers";
import { registerSchema } from "./schemas/tableSchemas";
import { getMetadata } from "./schemas/tableMetadata";
import { decodeField } from "./schemas/decodeField";
import { TableSchema } from "./common";

export async function decodeStoreSetField(
  contract: Contract,
  table: TableId,
  keyTuple: string[],
  schemaIndex: number,
  data: string
): Promise<{ schema: TableSchema; value: ComponentValue }> {
  const schema = await registerSchema(contract, table);
  const value = decodeField(schema, schemaIndex, data);

  const metadata = getMetadata(contract, table);
  if (metadata) {
    const { tableName, fieldNames } = metadata;
    return {
      schema,
      value: {
        ...value,
        [fieldNames[schemaIndex]]: value[schemaIndex],
      },
    };
  }

  return { schema, value };
}

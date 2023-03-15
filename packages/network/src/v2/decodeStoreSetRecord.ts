import { ComponentValue } from "@latticexyz/recs";
import { TableId, arrayToHex } from "@latticexyz/utils";
import { Contract, utils } from "ethers";
import { registerSchema } from "./schemas/tableSchemas";
import { registerMetadata } from "./schemas/tableMetadata";
import { decodeData } from "./schemas/decodeData";
import { schemaTableId, metadataTableId } from "./common";

export async function decodeStoreSetRecord(
  contract: Contract,
  table: TableId,
  keyTuple: string[],
  data: string
): Promise<ComponentValue> {
  // registerSchema event
  if (table.toHexString() === schemaTableId.toHexString()) {
    const [tableForSchema, ...otherKeys] = keyTuple;
    if (otherKeys.length) {
      console.warn(
        "registerSchema event has more than one value in key tuple, but this method only supports a single key",
        { table, keyTuple }
      );
    }
    registerSchema(contract, TableId.fromBytes32(utils.arrayify(tableForSchema)), data);
  }

  const schema = await registerSchema(contract, table);
  const decoded = decodeData(schema, data);

  if (table.toHexString() === metadataTableId.toHexString()) {
    const [tableForMetadata, ...otherKeys] = keyTuple;
    if (otherKeys.length) {
      console.warn(
        "setMetadata event has more than one value in key tuple, but this method only supports a single key",
        { table, keyTuple }
      );
    }
    const tableName = decoded[0];
    const [fieldNames] = utils.defaultAbiCoder.decode(["string[]"], decoded[1]);
    registerMetadata(contract, TableId.fromBytes32(utils.arrayify(tableForMetadata)), { tableName, fieldNames });
  }

  const metadata = await registerMetadata(contract, table);
  if (metadata) {
    const { tableName, fieldNames } = metadata;
    const namedValues: Record<string, any> = {};
    for (const [index, fieldName] of fieldNames.entries()) {
      namedValues[fieldName] = decoded[index];
    }
    return {
      ...decoded,
      ...namedValues,
    };
  }

  return decoded;
}

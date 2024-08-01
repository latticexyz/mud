import { Schema } from "@latticexyz/config";
import { getSchemaPrimitives } from "@latticexyz/protocol-parser/internal";
import { decodeDozerField } from "./decodeDozerField";

type DozerQueryHeader = string[];
type DozerQueryRecord = (string | boolean | string[])[];

// First item in the result is the header
export type DozerQueryResult = [DozerQueryHeader, ...DozerQueryRecord[]];

export type DecodeDozerRecordsArgs = {
  schema: Schema;
  records: DozerQueryResult;
};

/**
 * Trim the header row from the query result
 */
function trimHeader(result: DozerQueryResult): DozerQueryRecord[] {
  return result.slice(1);
}

export type DecodeDozerRecordsResult<schema extends Schema = Schema> = getSchemaPrimitives<schema>[];

export function decodeDozerRecords<schema extends Schema>({
  schema,
  records,
}: DecodeDozerRecordsArgs): DecodeDozerRecordsResult<schema> {
  const fieldNames = Object.keys(schema);
  if (records.length > 0 && fieldNames.length !== records[0].length) {
    throw new Error(
      `Mismatch between schema and query result.\nSchema: [${fieldNames.join(", ")}]\nQuery result: [${records[0].join(", ")}]`,
    );
  }

  return trimHeader(records).map((record) =>
    Object.fromEntries(
      Object.keys(schema).map((fieldName, index) => [
        fieldName,
        decodeDozerField(schema[fieldName].type, record[index]),
      ]),
    ),
  ) as never;
}

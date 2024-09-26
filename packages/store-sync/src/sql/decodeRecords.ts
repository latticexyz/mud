import { Schema } from "@latticexyz/config";
import { getSchemaPrimitives } from "@latticexyz/protocol-parser/internal";
import { decodeField } from "./decodeField";

type QueryHeader = string[];
type QueryRecord = (string | boolean | string[])[];

// First item in the result is the header
export type QueryResult = [QueryHeader, ...QueryRecord[]];

/**
 * Trim the header row from the query result
 */
function trimHeader(result: QueryResult): QueryRecord[] {
  return result.slice(1);
}

export type DecodeRecordsArgs = {
  schema: Schema;
  records: QueryResult;
};

export type DecodeRecordsResult<schema extends Schema = Schema> = getSchemaPrimitives<schema>[];

export function decodeRecords<schema extends Schema>({
  schema,
  records,
}: DecodeRecordsArgs): DecodeRecordsResult<schema> {
  const fieldNames = Object.keys(schema);
  if (records.length > 0 && fieldNames.length !== records[0].length) {
    throw new Error(
      `Mismatch between schema and query result.\nSchema: [${fieldNames.join(", ")}]\nQuery result: [${records[0].join(", ")}]`,
    );
  }

  return trimHeader(records).map((record) =>
    Object.fromEntries(
      Object.keys(schema).map((fieldName, index) => [fieldName, decodeField(schema[fieldName].type, record[index])]),
    ),
  ) as never;
}

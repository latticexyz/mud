import { DynamicPrimitiveType, StaticPrimitiveType } from "@latticexyz/schema-type";
import { ZustandStore } from "../zustand";
import { AllTables, Query } from "./common";
import { StoreConfig, Tables } from "@latticexyz/store";
import { groupBy } from "@latticexyz/common/utils";
import { encodeAbiParameters } from "viem";

type QueryResult<query extends Query> = {
  // TODO: resolve the actual types via config look up of query subjects
  readonly subjects: readonly (StaticPrimitiveType | DynamicPrimitiveType)[];
  // TODO: infer whether records should be here if records was provided in query
  // TODO: resolve record types from config and requested table records
  // eslint-disable-next-line @typescript-eslint/ban-types
  readonly records?: readonly Object[];
};

// TODO: validate query
//       - one subject per table
//       - underlying subject field types match
//       - only keys as subjects for now?
//       - subjects and conditions all have valid fields

// TODO: make query smarter/config aware for shorthand

export function query<config extends StoreConfig, extraTables extends Tables | undefined>(
  store: ZustandStore<AllTables<config, extraTables>>,
  query: Query
): Promise<QueryResult<typeof query>> {
  // TODO: add record subjects to this list?
  const subjectsByTable = groupBy([...query.from, ...(query.except ?? [])], (subject) => subject.tableId);

  const records = Object.values(store.getState().records)
    .filter((record) => subjectsByTable.has(record.table.tableId))
    .map((record) => {
      const schema = { ...record.table.keySchema, ...record.table.valueSchema };
      const fields = { ...record.key, ...record.value };
      const subjectFields = subjectsByTable.get(record.table.tableId)![0].subject;
      const subject = subjectFields.map((field) => fields[field]);
      const subjectSchema = subjectFields.map((field) => schema[field]);
      // TODO: fix subject type
      const encodedSubject = encodeAbiParameters(subjectSchema, subject);
      return { ...record, subject, encodedSubject };
    });

  const recordsByTable = groupBy(records, (record) => record.table.tableId);

  //

  return Promise.resolve({ subjects: [] });
}

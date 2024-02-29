import { DynamicPrimitiveType, StaticPrimitiveType } from "@latticexyz/schema-type";
import { ZustandStore } from "../zustand";
import { AllTables, Query } from "./common";
import { StoreConfig, Tables } from "@latticexyz/store";
import { groupBy } from "@latticexyz/common/utils";
import { encodeAbiParameters } from "viem";
import { matchesCondition } from "./conditions";

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
  // TODO: handle `query.except` subjects
  // TODO: handle `query.records` subjects
  const fromTables = Object.fromEntries(query.from.map((subject) => [subject.tableId, subject.subject]));

  const records = Object.values(store.getState().records)
    .filter((record) => fromTables[record.table.tableId])
    .map((record) => {
      const subjectFields = fromTables[record.table.tableId];
      const schema = { ...record.table.keySchema, ...record.table.valueSchema };
      const fields = { ...record.key, ...record.value };
      const subject = subjectFields.map((field) => fields[field]);
      const subjectSchema = subjectFields.map((field) => schema[field]);
      // TODO: fix subject type
      const encodedSubject = encodeAbiParameters(subjectSchema, subject);
      return {
        ...record,
        schema,
        fields,
        subjectSchema,
        subject,
        encodedSubject,
      };
    });

  const matches = Array.from(groupBy(records, (record) => record.encodedSubject).values())
    .map((records) => ({
      subject: records[0].subject,
      encodedSubject: records[0].encodedSubject,
      records,
    }))
    .filter(({ records }) => {
      // make sure our matched subject has records in all `query.from` tables
      const tableIds = Array.from(new Set(records.map((record) => record.table.tableId)));
      return tableIds.length === query.from.length;
    })
    .filter((match) => (query.where ? query.where.every((condition) => matchesCondition(condition, match)) : true));

  return Promise.resolve({ subjects: matches.map((match) => match.subject) });
}

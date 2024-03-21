import { encodeAbiParameters } from "viem";
import { Table } from "@latticexyz/config";
import { groupBy, uniqueBy } from "@latticexyz/common/utils";
import { Query, SubjectRecords } from "./api";
import { matchRecords } from "./matchRecords";
import { TableRecord } from "./common";

// This assumes upstream has fully validated query
// This also assumes we have full records, which may not always be the case and we may need some way to request records for a given table subject
// We don't carry around config types here for ease, they get handled by the wrapping `query` function

export type FindSubjectsParameters<table extends Table> = {
  readonly records: readonly TableRecord<table>[];
  readonly query: Query;
};

// TODO: make condition types smarter? so condition literal matches the field primitive type

export function findSubjects<table extends Table>({
  records: initialRecords,
  query,
}: FindSubjectsParameters<table>): readonly SubjectRecords[] {
  const targetTables = Object.fromEntries(
    uniqueBy([...query.from, ...(query.except ?? [])], (subject) => subject.tableId).map((subject) => [
      subject.tableId,
      subject.subject,
    ]),
  );
  const fromTableIds = new Set(query.from.map((subject) => subject.tableId));
  const exceptTableIds = new Set((query.except ?? []).map((subject) => subject.tableId));

  // TODO: store/lookup subjects separately rather than mapping each time so we can "memoize" better?
  const records = initialRecords
    .filter((record) => targetTables[record.table.tableId])
    .map((record) => {
      const subjectFields = targetTables[record.table.tableId];
      const subject = subjectFields.map((field) => record.fields[field]);
      const subjectSchema = subjectFields.map((field) => record.table.schema[field]);
      const subjectId = encodeAbiParameters(subjectSchema, subject);
      return {
        ...record,
        subjectSchema,
        subject,
        subjectId,
      };
    });

  const matchedSubjects = Array.from(groupBy(records, (record) => record.subjectId).values())
    .map((records) => ({
      subjectId: records[0].subjectId,
      subject: records[0].subject,
      subjectSchema: records[0].subjectSchema.map((abiType) => abiType.type),
      records,
    }))
    .filter(({ records }) => {
      // make sure our matched subject has no records in `query.except` tables
      return exceptTableIds.size ? !records.some((record) => exceptTableIds.has(record.table.tableId)) : true;
    })
    .filter(({ records }) => {
      // make sure our matched subject has records in all `query.from` tables
      const tableIds = new Set(records.map((record) => record.table.tableId));
      return tableIds.size === fromTableIds.size;
    })
    .map((match) => {
      if (!query.where) return match;

      let records: readonly TableRecord<table>[] = match.records;
      for (const condition of query.where) {
        if (!records.length) break;
        records = matchRecords(condition, records);
      }

      return { ...match, records };
    })
    .filter((match) => match.records.length > 0);

  const subjects = matchedSubjects.map((match) => ({
    subject: match.subject,
    subjectSchema: match.subjectSchema,
    records: match.records.map((record) => ({
      tableId: record.table.tableId,
      primaryKey: record.primaryKey,
      keyTuple: record.keyTuple,
      fields: record.fields,
    })),
  }));

  return subjects;
}

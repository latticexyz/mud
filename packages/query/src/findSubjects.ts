import { encodeAbiParameters } from "viem";
import { ResolvedTableConfig } from "@latticexyz/store/config/v2";
import { groupBy, uniqueBy } from "@latticexyz/common/utils";
import { Query, QueryResultSubject } from "./api";
import { matchesCondition } from "./matchesCondition";
import { TableRecord } from "./common";

// This assumes upstream has fully validated query
// This also assumes we have full records, which may not always be the case and we may need some way to request records for a given table subject
// We don't carry around config types here for ease, they get handled by the wrapping `query` function

export type FindSubjectsParameters<table extends ResolvedTableConfig> = {
  readonly records: readonly TableRecord<table>[];
  readonly query: Query;
};

export type FindSubjectsResult = {
  readonly subjects: readonly QueryResultSubject[];
};

// TODO: make condition types smarter? so condition literal matches the field primitive type

export function findSubjects<table extends ResolvedTableConfig>({
  records: initialRecords,
  query,
}: FindSubjectsParameters<table>): FindSubjectsResult {
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
      const id = encodeAbiParameters(subjectSchema, subject);
      return {
        ...record,
        subjectSchema,
        subject,
        id,
      };
    });

  const matchedSubjects = Array.from(groupBy(records, (record) => record.id).values())
    .map((records) => ({
      id: records[0].id,
      subject: records[0].subject,
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
    // TODO: fix match type
    .filter((match) => (query.where ? query.where.every((condition) => matchesCondition(condition, match)) : true));

  const subjects = matchedSubjects.map((match) => match.subject);

  return { subjects };
}

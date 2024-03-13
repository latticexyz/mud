import { Table } from "@latticexyz/store";
import { TableRecord } from "../zustand/common";
import { ComparisonCondition, ConditionLiteral, QueryCondition, TableSubject } from "./api";

type MatchedSubjectRecord<table extends Table> = TableRecord<table> & {
  fields: TableRecord<table>["key"] & TableRecord<table>["value"];
};

type MatchedSubject<table extends Table> = {
  readonly subject: TableSubject;
  readonly records: readonly MatchedSubjectRecord<table>[];
};

const comparisons = {
  "<": (left, right) => left < right,
  "<=": (left, right) => left <= right,
  "=": (left, right) => left === right,
  ">": (left, right) => left > right,
  ">=": (left, right) => left >= right,
  "!=": (left, right) => left !== right,
} as const satisfies Record<ComparisonCondition["op"], (left: ConditionLiteral, right: ConditionLiteral) => boolean>;

export function matchesCondition<table extends Table>(
  condition: QueryCondition,
  subject: MatchedSubject<table>,
): boolean {
  switch (condition.op) {
    case "<":
    case "<=":
    case "=":
    case ">":
    case ">=":
    case "!=":
      return subject.records.some(
        (record) =>
          record.table.tableId === condition.left.tableId &&
          comparisons[condition.op](record.fields[condition.left.field], condition.right),
      );
    case "in":
      return subject.records.some(
        (record) =>
          record.table.tableId === condition.left.tableId &&
          condition.right.includes(record.fields[condition.left.field]),
      );
  }
}

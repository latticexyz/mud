import { ResolvedTableConfig } from "@latticexyz/store/config/v2";
import { ComparisonCondition, ConditionLiteral, QueryCondition } from "./api";
import { TableRecord } from "./common";

export type MatchedSubject<table extends ResolvedTableConfig = ResolvedTableConfig> = {
  readonly subject: readonly string[];
  readonly records: readonly TableRecord<table>[];
};

const comparisons = {
  "<": (left, right) => left < right,
  "<=": (left, right) => left <= right,
  "=": (left, right) => left === right,
  ">": (left, right) => left > right,
  ">=": (left, right) => left >= right,
  "!=": (left, right) => left !== right,
} as const satisfies Record<ComparisonCondition["op"], (left: ConditionLiteral, right: ConditionLiteral) => boolean>;

// TODO: adapt this to return matching records, not just a boolean

export function matchesCondition<table extends ResolvedTableConfig = ResolvedTableConfig>(
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

import { Table } from "@latticexyz/config";
import { ComparisonCondition, ConditionLiteral, QueryCondition } from "./api";
import { TableRecord } from "./common";

const comparisons = {
  "<": (left, right) => left < right,
  "<=": (left, right) => left <= right,
  "=": (left, right) => left === right,
  ">": (left, right) => left > right,
  ">=": (left, right) => left >= right,
  "!=": (left, right) => left !== right,
} as const satisfies Record<ComparisonCondition["op"], (left: ConditionLiteral, right: ConditionLiteral) => boolean>;

export function matchRecords<table extends Table = Table>(
  condition: QueryCondition,
  records: readonly TableRecord<table>[],
): readonly TableRecord<table>[] {
  switch (condition.op) {
    case "<":
    case "<=":
    case "=":
    case ">":
    case ">=":
    case "!=":
      return records.filter(
        (record) =>
          record.table.tableId === condition.left.tableId &&
          comparisons[condition.op](record.fields[condition.left.field], condition.right),
      );
    case "in":
      return records.filter(
        (record) =>
          record.table.tableId === condition.left.tableId &&
          condition.right.includes(record.fields[condition.left.field]),
      );
  }
}

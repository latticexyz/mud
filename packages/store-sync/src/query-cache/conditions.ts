import { Table } from "@latticexyz/store";
import { TableRecord } from "../zustand/common";
import { ConditionLiteral, QueryCondition, TableField, TableSubject } from "./common";

type MatchedSubjectRecord<table extends Table> = TableRecord<table> & {
  fields: TableRecord<table>["key"] & TableRecord<table>["value"];
};

type MatchedSubject<table extends Table> = {
  readonly subject: TableSubject;
  readonly records: readonly MatchedSubjectRecord<table>[];
};

export function equalCondition<table extends Table>(
  left: TableField,
  right: ConditionLiteral,
  subject: MatchedSubject<table>
): boolean {
  return subject.records.some((record) => record.table.tableId === left.tableId && record.fields[left.field] === right);
}

export function matchesCondition<table extends Table>(
  condition: QueryCondition,
  subject: MatchedSubject<table>
): boolean {
  switch (condition.op) {
    case "=":
      return equalCondition(condition.left, condition.right, subject);
  }
  throw new Error("Unsupported query condition");
}

import { Hex } from "viem";

// TODO: move to some common utils file/module/package
export type satisfy<base, t extends base> = t;

export type TableField = {
  readonly tableId: Hex;
  readonly field: string;
};

export type TableSubject = {
  readonly tableId: Hex;
  readonly subject: readonly string[];
};

export type ConditionLiteral = string | number | boolean;

export type ComparisonCondition = {
  readonly left: TableField;
  readonly op: "<" | "<=" | "=" | ">" | ">=" | "!=";
  readonly right: TableField | ConditionLiteral;
};

export type InCondition = {
  readonly left: TableField;
  readonly op: "in";
  readonly right: readonly ConditionLiteral[];
};

export type QueryCondition = satisfy<{ readonly op: string }, ComparisonCondition | InCondition>;

export type Query = {
  readonly from: readonly TableSubject[];
  readonly except?: readonly TableSubject[];
  readonly where?: readonly QueryCondition[];
  readonly records?: readonly TableSubject[];
};

import { Hex } from "viem";
import { StaticPrimitiveType, DynamicPrimitiveType } from "@latticexyz/schema-type";
import { satisfy } from "@latticexyz/common/type-utils";

/**
 * These types represent the "over the wire" protocol (i.e. JSON) for the query API.
 */

export type TableField = {
  readonly tableId: Hex;
  readonly field: string;
};

export type TableSubject = {
  readonly tableId: Hex;
  readonly subject: readonly string[];
};

export type ConditionLiteral = boolean | number | bigint | string;

export type ComparisonCondition = {
  readonly left: TableField;
  readonly op: "<" | "<=" | "=" | ">" | ">=" | "!=";
  // TODO: add support for TableField
  readonly right: ConditionLiteral;
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
};

export type QueryResultSubject = readonly (StaticPrimitiveType | DynamicPrimitiveType)[];

export type QueryResult = {
  subjects: readonly QueryResultSubject[];
  // TODO: matched records
  // TODO: block number
};

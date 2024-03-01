import { StoreConfig, Tables, ResolvedStoreConfig } from "@latticexyz/store";
import { Hex } from "viem";
import { storeTables, worldTables } from "../common";

// TODO: move to some common utils file/module/package
export type satisfy<base, t extends base> = t;

// TODO: make this better with new config resolver
export type AllTables<
  config extends StoreConfig,
  extraTables extends Tables | undefined
> = ResolvedStoreConfig<config>["tables"] &
  (extraTables extends Tables ? extraTables : Record<never, never>) &
  typeof storeTables &
  typeof worldTables;

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

// TODO: move this into some "wire" type and then make this more client specific (uses config to validate)
export type Query = {
  readonly from: readonly TableSubject[];
  readonly except?: readonly TableSubject[];
  readonly where?: readonly QueryCondition[];
};

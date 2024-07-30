import { Hex } from "viem";
import { satisfy } from "@ark/util";
import { StaticPrimitiveType, DynamicPrimitiveType, SchemaAbiType } from "@latticexyz/schema-type/internal";
import { SchemaToPrimitives } from "@latticexyz/store/internal";
import { Table } from "@latticexyz/config";

/**
 * These types represent the "over the wire" protocol (i.e. JSON) for the query API.
 *
 * Currently always returns matching records for each subject. We may add separate endpoints and return types for just subjects later.
 */

// TODO: decide if we want to support stronger types here (e.g. table generic that constrains subjects, records, etc.)
// TODO: decide if/how we want to add block number throughout (esp as it relates to instant sequencing)
// TODO: separate set of types for querying just

export type QueryTable = {
  readonly tableId: Hex;
  readonly field: string;
};

export type QuerySubject = {
  readonly tableId: Hex;
  readonly subject: readonly string[];
};

// TODO: should we exclude arrays? might be hard to support array comparisons in SQL
export type ConditionLiteral = StaticPrimitiveType | DynamicPrimitiveType;

export type ComparisonCondition = {
  readonly left: QueryTable;
  readonly op: "<" | "<=" | "=" | ">" | ">=" | "!=";
  // TODO: add support for QueryTable
  readonly right: ConditionLiteral;
};

export type InCondition = {
  readonly left: QueryTable;
  readonly op: "in";
  readonly right: readonly ConditionLiteral[];
};

export type QueryCondition = satisfy<{ readonly op: string }, ComparisonCondition | InCondition>;

export type Query = {
  readonly from: readonly QuerySubject[];
  readonly except?: readonly QuerySubject[];
  readonly where?: readonly QueryCondition[];
};

export type PrimitiveType = StaticPrimitiveType | DynamicPrimitiveType;

export type ResultRecord = {
  readonly tableId: Hex;
  readonly keyTuple: readonly Hex[];
  readonly primaryKey: readonly StaticPrimitiveType[];
  readonly fields: SchemaToPrimitives<Table["schema"]>;
};

export type Subject = readonly PrimitiveType[];
export type SubjectSchema = readonly SchemaAbiType[];

export type SubjectRecords = {
  readonly subject: Subject;
  readonly subjectSchema: SubjectSchema;
  readonly records: readonly ResultRecord[];
};

// TODO: consider flattening this to be more like `ResultRecord & { subject: Subject }`
export type SubjectRecord = {
  readonly subject: Subject;
  readonly subjectSchema: SubjectSchema;
  readonly record: ResultRecord;
};

// TODO: for change event, should this include previous record?
// TODO: use merge helper instead of `&` intersection?
export type SubjectEvent = SubjectRecord & {
  /**
   * `enter` = a new subject+record pair matched
   * `exit` = a subject+record pair no longer matches
   * `change` = the record oft he subject+record pair changed
   */
  readonly type: "enter" | "exit" | "change";
};

export type Result = {
  readonly subjects: readonly SubjectRecords[];
};

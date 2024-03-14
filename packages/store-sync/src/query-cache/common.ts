import { Config, Table } from "@latticexyz/store/config/v2";
import { SchemaAbiType, SchemaAbiTypeToPrimitiveType } from "@latticexyz/schema-type";
import { ComparisonCondition, InCondition } from "@latticexyz/query";

export type mapTuple<tuple, mapping> = {
  [key in keyof tuple]: tuple[key] extends keyof mapping ? mapping[tuple[key]] : never;
};

export type subjectSchemaToPrimitive<tuple> = {
  [key in keyof tuple]: tuple[key] extends SchemaAbiType ? SchemaAbiTypeToPrimitiveType<tuple[key]> : never;
};

export type Tables = Config["tables"];

export type TableSubjectItem<table extends Table = Table> = keyof table["schema"];

export type TableSubject<table extends Table = Table> = readonly [
  TableSubjectItem<table>,
  ...TableSubjectItem<table>[],
];

export type schemaAbiTypes<schema extends Record<string, { readonly type: SchemaAbiType }>> = {
  [key in keyof schema]: schema[key]["type"];
};

type tableConditions<tableName extends string, table extends Table = Table> = {
  [field in keyof table["schema"]]:
    | [
        `${tableName}.${field & string}`,
        ComparisonCondition["op"],
        SchemaAbiTypeToPrimitiveType<table["schema"][field]["type"]>,
      ]
    | [
        `${tableName}.${field & string}`,
        InCondition["op"],
        readonly SchemaAbiTypeToPrimitiveType<table["schema"][field]["type"]>[],
      ];
}[keyof table["schema"]];

export type queryConditions<tables extends Tables> = {
  [tableName in keyof tables]: tableConditions<tableName & string, tables[tableName]>;
}[keyof tables];

export type QuerySubjects<tables extends Tables = Tables> = {
  readonly [k in keyof tables]?: readonly [keyof tables[k]["schema"], ...(keyof tables[k]["schema"])[]];
};

export type Query<tables extends Tables = Tables> = {
  readonly from: QuerySubjects<tables>;
  readonly except?: QuerySubjects<tables>;
  readonly where?: readonly queryConditions<tables>[];
};

export type extractTables<T> = T extends Query<infer tables> ? tables : never;

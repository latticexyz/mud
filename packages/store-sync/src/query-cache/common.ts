import { Store } from "@latticexyz/store";
import { Table } from "@latticexyz/config";
import { SchemaAbiType, SchemaAbiTypeToPrimitiveType } from "@latticexyz/schema-type/internal";
import { ComparisonCondition, InCondition } from "@latticexyz/query";

export type mapTuple<tuple, mapping> = {
  [key in keyof tuple]: tuple[key] extends keyof mapping ? mapping[tuple[key]] : never;
};

export type subjectSchemaToPrimitive<tuple> = {
  [key in keyof tuple]: tuple[key] extends SchemaAbiType ? SchemaAbiTypeToPrimitiveType<tuple[key]> : never;
};

export type Tables = Store["tables"];

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

type queryConditions<tables extends Tables> = {
  [tableName in keyof tables]: tableConditions<tableName & string, tables[tableName]>;
}[keyof tables];

export type Query<tables extends Tables = Tables> = {
  readonly from: {
    readonly [k in keyof tables]?: readonly [keyof tables[k]["schema"], ...(keyof tables[k]["schema"])[]];
  };
  readonly except?: {
    readonly [k in keyof tables]?: readonly [keyof tables[k]["schema"], ...(keyof tables[k]["schema"])[]];
  };
  readonly where?: readonly queryConditions<tables>[];
};

export type extractTables<T> = T extends Query<infer tables> ? tables : never;

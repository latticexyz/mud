import { ResolvedStoreConfig, ResolvedTableConfig } from "@latticexyz/store/config/v2";
import { SchemaAbiType, SchemaAbiTypeToPrimitiveType } from "@latticexyz/schema-type";
import { ComparisonCondition, InCondition } from "@latticexyz/query";

export type mapTuple<tuple, mapping> = {
  [key in keyof tuple]: tuple[key] extends keyof mapping ? mapping[tuple[key]] : never;
};

export type subjectSchemaToPrimitive<tuple> = {
  [key in keyof tuple]: tuple[key] extends SchemaAbiType ? SchemaAbiTypeToPrimitiveType<tuple[key]> : never;
};

export type Tables = ResolvedStoreConfig["tables"];

export type TableSubjectItem<table extends ResolvedTableConfig = ResolvedTableConfig> = keyof table["schema"];

export type TableSubject<table extends ResolvedTableConfig = ResolvedTableConfig> = readonly [
  TableSubjectItem<table>,
  ...TableSubjectItem<table>[],
];

export type schemaAbiTypes<schema extends Record<string, { readonly type: SchemaAbiType }>> = {
  [key in keyof schema]: schema[key]["type"];
};

type tableConditions<tableName extends string, table extends ResolvedTableConfig = ResolvedTableConfig> = {
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

export type queryToResultSubject<query extends Query<tables>, tables extends Tables> = {
  [table in keyof query["from"]]: table extends keyof tables
    ? subjectSchemaToPrimitive<mapTuple<query["from"][table], schemaAbiTypes<tables[table]["schema"]>>>
    : never;
}[keyof query["from"]];

export type QueryResult<query extends Query<tables>, tables extends Tables = Tables> = {
  readonly subjects: readonly queryToResultSubject<query, tables>[];
};

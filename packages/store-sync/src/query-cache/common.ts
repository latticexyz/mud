import { ResolvedStoreConfig, ResolvedTableConfig } from "@latticexyz/store/config/v2";
import { SchemaAbiType, SchemaAbiTypeToPrimitiveType } from "@latticexyz/schema-type";
import { ComparisonCondition, InCondition } from "@latticexyz/query";

export type mapTuple<tuple, mapping> = {
  [key in keyof tuple]: tuple[key] extends keyof mapping ? mapping[tuple[key]] : never;
};

export type subjectSchemaToPrimitive<tuple> = {
  [key in keyof tuple]: tuple[key] extends SchemaAbiType ? SchemaAbiTypeToPrimitiveType<tuple[key]> : never;
};

export type TableSubjectItem<table extends ResolvedTableConfig = ResolvedTableConfig> =
  table["schema"][keyof table["schema"]]["type"];

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

type queryConditions<config extends ResolvedStoreConfig = ResolvedStoreConfig> = {
  [table in keyof config["tables"]]: tableConditions<table & string, config["tables"][table]>;
}[keyof config["tables"]];

export type Query<config extends ResolvedStoreConfig = ResolvedStoreConfig> = {
  readonly from: {
    readonly [k in keyof config["tables"]]?: readonly [
      keyof config["tables"][k]["schema"],
      ...(keyof config["tables"][k]["schema"])[],
    ];
  };
  readonly except?: {
    readonly [k in keyof config["tables"]]?: readonly [
      keyof config["tables"][k]["schema"],
      ...(keyof config["tables"][k]["schema"])[],
    ];
  };
  readonly where?: readonly queryConditions<config>[];
};

export type queryToResultSubject<
  query extends Query<config>,
  config extends ResolvedStoreConfig = ResolvedStoreConfig,
> = {
  [table in keyof query["from"]]: table extends keyof config["tables"]
    ? subjectSchemaToPrimitive<mapTuple<query["from"][table], schemaAbiTypes<config["tables"][table]["schema"]>>>
    : never;
}[keyof query["from"]];

export type QueryResult<query extends Query<config>, config extends ResolvedStoreConfig = ResolvedStoreConfig> = {
  readonly subjects: readonly queryToResultSubject<query, config>[];
};

import { ResolvedStoreConfig } from "@latticexyz/store/ts/config/v2/store";
import { SchemaAbiType, SchemaAbiTypeToPrimitiveType } from "@latticexyz/schema-type";
import { evaluate } from "@latticexyz/common/type-utils";
import { ComparisonCondition, InCondition } from "./api";

type mapTuple<tuple, mapping> = {
  [key in keyof tuple]: tuple[key] extends keyof mapping ? mapping[tuple[key]] : never;
};

type subjectSchemaToPrimitive<tuple> = {
  [key in keyof tuple]: tuple[key] extends SchemaAbiType ? SchemaAbiTypeToPrimitiveType<tuple[key]> : never;
};

type schemaAbiTypes<schema extends Record<string, { readonly type: SchemaAbiType }>> = {
  [key in keyof schema]: schema[key]["type"];
};

// TODO: simplify/break out this type
type queryConditions<config extends ResolvedStoreConfig = ResolvedStoreConfig> = {
  [table in keyof config["tables"]]: {
    [field in keyof config["tables"][table]["schema"]]:
      | [
          config["tables"][table],
          field,
          ComparisonCondition["op"],
          // TODO: figure out why this type complains, maybe due to possibility of `never`?
          SchemaAbiTypeToPrimitiveType<config["tables"][table]["schema"][field]["type"]>,
        ]
      | [
          config["tables"][table],
          field,
          InCondition["op"],
          // TODO: figure out why this type complains, maybe due to possibility of `never`?
          readonly SchemaAbiTypeToPrimitiveType<config["tables"][table]["schema"][field]["type"]>[],
        ];
  }[keyof config["tables"][table]["schema"]];
}[keyof config["tables"]];

// [
//   config["tables"][keyof config["tables"]],
//   ComparisonCondition["op"],
//   //primitve
// ];

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

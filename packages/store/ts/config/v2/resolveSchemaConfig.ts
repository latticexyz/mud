export type StaticAbiType = "uint256" | "address" | "bool" | "bytes32";
export type AbiType = StaticAbiType | "bytes" | "string" | "bool[]";

export type SchemaConfigInput = SchemaFullConfigInput | SchemaShorthandConfigInput;

export type SchemaFullConfigInput = {
  [key: string]: AbiType;
};

export type SchemaShorthandConfigInput = AbiType;

export type StaticAbiTypeSchema = {
  [key: string]: StaticAbiType;
};

// TODO: how should shorthands be resolved? extending the schema with a `key` field by default?
export type resolveSchemaConfig<schemaConfigInput extends SchemaConfigInput> =
  schemaConfigInput extends SchemaFullConfigInput ? schemaConfigInput : { key: "bytes32"; value: schemaConfigInput };

export function resolveSchemaConfig<schemaConfigInput extends SchemaConfigInput>(
  schemaConfigInput: schemaConfigInput
): resolveSchemaConfig<schemaConfigInput> {
  // TODO: runtime implementation
  return {} as resolveSchemaConfig<schemaConfigInput>;
}

export type isStaticAbiType<abiType extends AbiType> = abiType extends StaticAbiType ? true : never;

export type isStaticAbiTypeSchema<schema extends SchemaConfigInput> =
  resolveSchemaConfig<schema> extends StaticAbiTypeSchema ? true : never;

export type extractStaticAbiKeys<schema extends SchemaConfigInput> =
  resolveSchemaConfig<schema> extends infer resolvedSchema
    ? {
        [key in keyof resolvedSchema]: resolvedSchema[key] extends StaticAbiType ? key : never;
      }[keyof resolvedSchema]
    : never;

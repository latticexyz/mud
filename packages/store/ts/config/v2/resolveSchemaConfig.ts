type StaticAbiType = "uint256" | "address" | "bool";
type AbiType = StaticAbiType | "bytes" | "string" | "bool[]";

export type SchemaConfigInput<keys extends string = string> = SchemaFullConfigInput<keys> | SchemaShorthandConfigInput;

export type SchemaFullConfigInput<keys extends string = string> = {
  [key in keys]: AbiType;
};

export type SchemaShorthandConfigInput = AbiType;

export type StaticAbiTypeSchema = {
  [key: string]: StaticAbiType;
};

export type resolveSchemaConfig<
  schemaConfigInput extends SchemaConfigInput<keys>,
  keys extends string = string
> = schemaConfigInput extends SchemaFullConfigInput<keys> ? schemaConfigInput : { key: schemaConfigInput };

export function resolveSchemaConfig<schemaConfigInput extends SchemaConfigInput<keys>, keys extends string = string>(
  schemaConfigInput: schemaConfigInput
): resolveSchemaConfig<schemaConfigInput, keys> {
  // TODO: runtime implementation
  return {} as resolveSchemaConfig<schemaConfigInput, keys>;
}

export type isStaticAbiType<abiType extends AbiType> = abiType extends StaticAbiType ? true : never;

export type isStaticAbiTypeSchema<schema extends SchemaConfigInput> =
  resolveSchemaConfig<schema> extends StaticAbiTypeSchema ? true : never;

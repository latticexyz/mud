export type StaticAbiType = "uint256" | "address" | "bool" | "bytes32";
export type AbiType = StaticAbiType | "bytes" | "string" | "bool[]";

export type SchemaConfigInput = Schema;

export type Schema = {
  [key: string]: AbiType;
};

export type StaticSchema = {
  [key: string]: StaticAbiType;
};

export type isStaticAbiType<abiType extends AbiType> = abiType extends StaticAbiType ? true : never;

export type getStaticAbiTypeKeys<schema extends SchemaConfigInput> = {
  [key in keyof schema]: schema[key] extends StaticAbiType ? key : never;
}[keyof schema];

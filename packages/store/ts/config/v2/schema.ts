export type StaticAbiType = "uint256" | "address" | "bool" | "bytes32";
export type AbiType = StaticAbiType | "bytes" | "string" | "bool[]";

export type Schema = {
  [key: string]: AbiType;
};

export type StaticSchema = {
  [key: string]: StaticAbiType;
};

export type isStaticAbiType<abiType extends AbiType> = abiType extends StaticAbiType ? true : never;

export type getStaticAbiTypeKeys<schema extends Schema> = Schema extends schema
  ? // If `schema` is the default Schema type, return a broad string type
    string
  : {
      [key in keyof schema]: schema[key] extends StaticAbiType ? key : never;
    }[keyof schema];

export type getDynamicAbiTypeKeys<schema extends Schema> = Schema extends schema
  ? // If `schema` is the default Schema type, return a broad string type
    string
  : Exclude<keyof schema, getStaticAbiTypeKeys<schema>>;

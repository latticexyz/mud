export type StaticAbiType = "uint256" | "address" | "bool" | "bytes32";
export type AbiType = StaticAbiType | "bytes" | "string" | "bool[]";

export type SchemaInput<userTypes extends UserTypes = UserTypes> = UserTypes extends userTypes
  ? // Only allow keyof userTypes if a narrow userTypes type is passed in
    {
      [key: string]: AbiType;
    }
  : {
      [key: string]: AbiType | keyof userTypes;
    };

export type StaticSchemaInput<userTypes extends StaticUserTypes = StaticUserTypes> = StaticUserTypes extends userTypes
  ? // Only allow keyof userTypes if a narrow userTypes type is passed in
    {
      [key: string]: StaticAbiType;
    }
  : {
      [key: string]: AbiType | keyof userTypes;
    };

export type UserTypes = {
  [key: string]: AbiType;
};

export type StaticUserTypes = {
  [key: string]: StaticAbiType;
};

export type isStaticAbiType<abiType extends AbiType> = abiType extends StaticAbiType ? true : never;

export type getStaticAbiTypeKeys<schema extends SchemaInput> = SchemaInput extends schema
  ? // If `schema` is the default Schema type, return a broad string type
    string
  : {
      [key in keyof schema]: schema[key] extends StaticAbiType ? key : never;
    }[keyof schema];

export type getDynamicAbiTypeKeys<schema extends SchemaInput> = SchemaInput extends schema
  ? // If `schema` is the default Schema type, return a broad string type
    string
  : Exclude<keyof schema, getStaticAbiTypeKeys<schema>>;

export type resolveSchema<schema extends SchemaInput<userTypes>, userTypes extends UserTypes> = {
  [key in keyof schema]: {
    type: schema[key] extends keyof userTypes ? userTypes[schema[key]] : schema[key];
    internalType: schema[key];
  };
};

export function resolveSchema<schema extends SchemaInput<userTypes>, userTypes extends UserTypes>(
  schema: schema,
  userTypes: userTypes
): resolveSchema<schema, userTypes> {
  // TODO: runtime implementation
  return {} as never;
}

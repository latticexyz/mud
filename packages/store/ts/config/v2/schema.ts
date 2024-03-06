import { StaticAbiType, AbiType } from "./scope";

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

export type getStaticAbiTypeKeys<
  schema extends SchemaInput<userTypes>,
  userTypes extends UserTypes = UserTypes
> = SchemaInput extends schema
  ? // If `schema` is the default Schema type, return a broad string type
    string
  : UserTypes extends userTypes
  ? // If no narrow userTypes is passed in, ignore userTypes
    {
      [key in keyof schema]: schema[key] extends StaticAbiType ? key : never;
    }[keyof schema]
  : // If narrow userTypes is passed in, also allow static user types as keys
    {
      [key in keyof schema]: schema[key] extends keyof userTypes
        ? // If the type is user type, check if the corresponding user type is static
          userTypes[schema[key]] extends StaticAbiType
          ? key
          : never
        : // Otherwise check if the ABI type is static
        schema[key] extends StaticAbiType
        ? key
        : never;
    }[keyof schema];

export type getDynamicAbiTypeKeys<
  schema extends SchemaInput<userTypes>,
  userTypes extends UserTypes = UserTypes
> = SchemaInput extends schema
  ? // If `schema` is the default Schema type, return a broad string type
    string
  : Exclude<keyof schema, getStaticAbiTypeKeys<schema, userTypes>>;

export type resolveSchema<schema, userTypes extends UserTypes> = schema extends SchemaInput<userTypes>
  ? UserTypes extends userTypes
    ? {
        [key in keyof schema]: {
          type: schema[key];
          internalType: schema[key];
        };
      }
    : {
        [key in keyof schema]: {
          type: schema[key] extends keyof userTypes ? userTypes[schema[key]] : schema[key];
          internalType: schema[key];
        };
      }
  : never;

export function resolveSchema<schema extends SchemaInput<userTypes>, userTypes extends UserTypes = UserTypes>(
  schema: schema,
  userTypes?: userTypes
): resolveSchema<schema, userTypes> {
  // TODO: runtime implementation
  return {} as never;
}

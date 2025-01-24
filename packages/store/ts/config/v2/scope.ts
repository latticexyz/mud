import { Dict, show } from "@ark/util";
import { SchemaInput } from "./input";
import { StaticAbiType, schemaAbiTypes } from "@latticexyz/schema-type/internal";
import { AbiType } from "./output";

export const Scope = { types: {} } as const satisfies ScopeOptions;
export type Scope = typeof Scope;

export type AbiTypeScope = ScopeOptions<{ [t in AbiType]: t }>;
export const AbiTypeScope = {
  types: Object.fromEntries(schemaAbiTypes.map((abiType) => [abiType, abiType])),
} as AbiTypeScope;

export type ScopeOptions<types extends Dict<string, AbiType> = Dict<string, AbiType>> = {
  types: types;
};

export type getStaticAbiTypeKeys<
  schema extends SchemaInput,
  scope extends Scope = AbiTypeScope,
> = SchemaInput extends schema
  ? string
  : {
      [key in keyof schema]: scope["types"] extends { [_ in schema[key]]: StaticAbiType } ? key : never;
    }[keyof schema];

export type extendScope<scope extends ScopeOptions, additionalTypes extends Dict<string, AbiType>> = show<
  ScopeOptions<show<scope["types"] & additionalTypes>>
>;

export function extendScope<scope extends ScopeOptions, additionalTypes extends Dict<string, AbiType>>(
  scope: scope,
  additionalTypes: additionalTypes,
): extendScope<scope, additionalTypes> {
  return {
    types: {
      ...scope.types,
      ...additionalTypes,
    },
  };
}

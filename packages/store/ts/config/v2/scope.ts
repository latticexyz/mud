import { Dict, evaluate } from "@arktype/util";
import { SchemaInput } from "./schema";
import { StaticAbiType, DynamicAbiType } from "@latticexyz/schema-type";

export type AbiType = StaticAbiType | DynamicAbiType;

export const EmptyScope = { types: {} } as const satisfies ScopeOptions;
export type EmptyScope = typeof EmptyScope;

export type AbiTypeScope = ScopeOptions<{ [t in AbiType]: t }>;
export const AbiTypeScope = { types: {} } as AbiTypeScope; // TODO: runtime implementation

export type ScopeOptions<types extends Dict<string, AbiType> = Dict<string, AbiType>> = {
  types: types;
};

export type getStaticAbiTypeKeys<
  types extends SchemaInput<scope>,
  scope extends AbiTypeScope = AbiTypeScope,
> = SchemaInput extends types
  ? string
  : {
      [key in keyof types]: scope["types"][types[key]] extends StaticAbiType ? key : never;
    }[keyof types];

export type extendScope<scope extends ScopeOptions, additionalTypes extends Dict<string, AbiType>> = evaluate<
  ScopeOptions<evaluate<scope["types"] & additionalTypes>>
>;

export function extendScope<scope extends ScopeOptions, additionalTypes extends Dict<string, AbiType>>(
  scope: scope,
  additionalTypes: additionalTypes,
): extendScope<scope, additionalTypes> {
  // TODO: runtime implementation
  return {} as never;
}

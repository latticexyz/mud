import { Dict, evaluate } from "@arktype/util";
import { SchemaInput } from "./schema";

export type StaticAbiType = "uint256" | "address" | "bool" | "bytes32";
export type AbiType = StaticAbiType | "bytes" | "string" | "bool[]";

export const EmptyScope = { staticTypes: {}, allTypes: {} } as const;

export type AbiTypeScope = ScopeOptions<{ [t in StaticAbiType]: t }, { [t in AbiType]: t }>;
export const AbiTypeScope = {} as AbiTypeScope; // TODO: runtime implementation

export type EmptyScope = ScopeOptions<(typeof EmptyScope)["staticTypes"], (typeof EmptyScope)["allTypes"]>;

export type ScopeOptions<
  staticTypes extends Dict<string, StaticAbiType> = Dict<string, StaticAbiType>,
  allTypes extends Dict<string, AbiType> = Dict<string, AbiType>
> = {
  staticTypes: staticTypes;
  allTypes: allTypes;
};

export type getStaticAbiTypeKeys<
  types extends SchemaInput<scope>,
  scope extends AbiTypeScope = AbiTypeScope
> = SchemaInput extends types
  ? string
  : {
      [key in keyof types]: scope["allTypes"][types[key]] extends StaticAbiType ? key : never;
    }[keyof types];

export type extendScope<scope extends ScopeOptions, types extends Dict<string, AbiType>> = evaluate<
  ScopeOptions<
    evaluate<scope["staticTypes"] & { [key in getStaticAbiTypeKeys<types>]: types[key] }>,
    evaluate<scope["allTypes"] & types>
  >
>;

export function extendScope<scope extends ScopeOptions, types extends Dict<string, AbiType>>(
  scope: scope,
  types: types
): extendScope<scope, types> {
  // TODO: runtime implementation
  return {} as never;
}

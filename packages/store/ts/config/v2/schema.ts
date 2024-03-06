import { evaluate } from "@arktype/util";
import { ScopeOptions, AbiTypeScope } from "./scope";

export type SchemaInput<scope extends ScopeOptions = AbiTypeScope> = {
  [key: string]: keyof scope["allTypes"];
};

export type resolveSchema<schema extends SchemaInput<scope>, scope extends ScopeOptions> = evaluate<{
  [key in keyof schema]: {
    type: scope["allTypes"][schema[key]];
    internalType: schema[key];
  };
}>;

export function resolveSchema<schema extends SchemaInput<scope>, scope extends ScopeOptions = AbiTypeScope>(
  schema: schema,
  scope?: scope
): resolveSchema<schema, scope> {
  // TODO: runtime implementation
  return {} as never;
}

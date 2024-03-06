import { evaluate } from "@arktype/util";
import { AbiTypeScope } from "./scope";

export type SchemaInput<scope extends AbiTypeScope = AbiTypeScope> = {
  readonly [key: string]: keyof scope["allTypes"];
};

export type resolveSchema<schema extends SchemaInput<scope>, scope extends AbiTypeScope> = evaluate<{
  [key in keyof schema]: {
    type: scope["allTypes"][schema[key]];
    internalType: schema[key];
  };
}>;

export function resolveSchema<schema extends SchemaInput<scope>, scope extends AbiTypeScope = AbiTypeScope>(
  schema: schema,
  scope?: scope
): resolveSchema<schema, scope> {
  // TODO: runtime implementation
  return {} as never;
}

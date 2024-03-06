import { evaluate } from "@arktype/util";
import { AbiTypeScope } from "./scope";

export type SchemaInput<scope extends AbiTypeScope = AbiTypeScope> = {
  [key: string]: keyof scope["allTypes"];
};

export type resolveSchema<schema extends SchemaInput<scope>, scope extends AbiTypeScope> = evaluate<{
  [key in keyof schema]: {
    /** the Solidity primitive ABI type */
    type: scope["allTypes"][schema[key]];
    /** the user defined type or Solidity primitive ABI type */
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

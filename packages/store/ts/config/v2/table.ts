import { StaticAbiType } from "@latticexyz/schema-type/deprecated";
import { Error } from "./error";
import { AbiType, Schema, getDynamicAbiTypeKeys, getStaticAbiTypeKeys } from "./schema";

/**
 * TODO
 * - Utils for resolving shorthand config into full config
 * - Splitting up into more smaller helper utils
 * - How can we create an error if the config doesn't match?
 */

export type NoStaticKeyFieldError = Error<"Provide a static `key` field or explicit key override">;

export type TableConfigInput<schema extends Schema = Schema> = TableFullConfigInput<schema> | TableShorthandConfigInput;

export type TableShorthandConfigInput = Schema | AbiType;

export type TableFullConfigInput<
  schema extends Schema = Schema,
  keys extends getStaticAbiTypeKeys<schema>[] = getStaticAbiTypeKeys<schema>[]
> = {
  schema: schema;
  keys: keys;
};

/**
 * If a shorthand table config is passed (just a schema or even just a single ABI type) we expand it with sane defaults.
 */
export type resolveTableShorthandConfig<input extends TableShorthandConfigInput> = input extends AbiType
  ? // If a single ABI type is provided as shorthand, expand it with a default `bytes32` key
    TableFullConfigInput<{ key: "bytes32"; value: input }, ["key"]>
  : input extends Schema
  ? "key" extends getStaticAbiTypeKeys<input>
    ? // If the shorthand includes a static field called `key`, use it as key
      TableFullConfigInput<input, ["key"]>
    : NoStaticKeyFieldError
  : // If `key` is not part of the shorthand fields, add a default `bytes32` key
    // TODO @David: why does this line not work
    // TableFullConfigInput<input & { key: "bytes32" }, ["key"]>
    never;

export function resolveTableShorthandConfig<input extends TableShorthandConfigInput>(
  input: input
): resolveTableShorthandConfig<input> {
  // TODO: runtime
  return input as unknown as resolveTableShorthandConfig<input>;
}

export type resolveTableConfig<input extends TableConfigInput> = input extends TableShorthandConfigInput
  ? resolveTableConfig<resolveTableShorthandConfig<input>>
  : never;

export function resolveTableConfig<input extends TableConfigInput>(input: input): resolveTableConfig<input> {
  // TODO: runtime implementation
  return {} as resolveTableConfig<input>;
}

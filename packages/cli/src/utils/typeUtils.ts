import { AbiType, StaticAbiType } from "@latticexyz/schema-type";

export type RequireKeys<T extends Record<string, unknown>, P extends string> = T & Required<Pick<T, P>>;

// This allows unions between string literals and `string` without sacrificing autocompletion.
// Workaround for https://github.com/Microsoft/TypeScript/issues/29729
export type StringForUnion = string & Record<never, never>;

export type StaticArray = `${StaticAbiType}[${number}]`;
// static arrays and inferred enum names get mixed together - this helper separates them
export type ExtractUserTypes<UnknownTypes extends StringForUnion> = Exclude<UnknownTypes, AbiType | StaticArray>;

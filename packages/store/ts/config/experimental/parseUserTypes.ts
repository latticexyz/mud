import { UserType } from "@latticexyz/common/codegen";

export type UserTypes = { readonly [k: string]: UserType };

export const defaultUserTypes = {} as const satisfies UserTypes;

export type ParseUserTypesInput = UserTypes | undefined;

export type ParseUserTypesOutput<TInput extends ParseUserTypesInput> = TInput extends undefined
  ? typeof defaultUserTypes
  : TInput;

export function parseUserTypes<TInput extends ParseUserTypesInput>(input: TInput): ParseUserTypesOutput<TInput> {
  return (input ?? defaultUserTypes) as ParseUserTypesOutput<TInput>;
}

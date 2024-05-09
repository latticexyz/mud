import { flatMorph } from "@arktype/util";
import { EnumsInput } from "./input";
import { AbiTypeScope, extendScope } from "./scope";
import { parseInt } from "./generics";

function isEnums(enums: unknown): enums is EnumsInput {
  return (
    typeof enums === "object" &&
    enums != null &&
    Object.values(enums).every((item) => Array.isArray(item) && item.every((element) => typeof element === "string"))
  );
}

export type scopeWithEnums<enums, scope extends AbiTypeScope = AbiTypeScope> = EnumsInput extends enums
  ? scope
  : enums extends EnumsInput
    ? extendScope<scope, { [key in keyof enums]: "uint8" }>
    : scope;

export function scopeWithEnums<enums, scope extends AbiTypeScope = AbiTypeScope>(
  enums: enums,
  scope: scope = AbiTypeScope as scope,
): scopeWithEnums<enums, scope> {
  if (isEnums(enums)) {
    const enumScope = Object.fromEntries(Object.keys(enums).map((key) => [key, "uint8" as const]));
    return extendScope(scope, enumScope) as never;
  }
  return scope as never;
}

export type resolveEnums<enums> = {
  readonly [key in keyof enums]: {
    readonly [element in keyof enums[key] as enums[key][element] & string]: parseInt<element>;
  };
};

export function resolveEnums<enums extends EnumsInput>(enums: enums): resolveEnums<enums> {
  return flatMorph(enums as never, (enumName, enumElements) => [
    enumName,
    flatMorph(enumElements, (enumIndex, enumElement) => [enumElement, enumIndex]),
  ]) as never;
}

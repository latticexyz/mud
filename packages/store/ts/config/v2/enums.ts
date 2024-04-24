import { Enums } from "./output";
import { AbiTypeScope, extendScope } from "./scope";

function isEnums(enums: unknown): enums is Enums {
  return (
    typeof enums === "object" &&
    enums != null &&
    Object.values(enums).every((item) => Array.isArray(item) && item.every((element) => typeof element === "string"))
  );
}

export type scopeWithEnums<enums, scope extends AbiTypeScope = AbiTypeScope> = Enums extends enums
  ? scope
  : enums extends Enums
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

export type resolveEnums<enums> = { readonly [key in keyof enums]: Readonly<enums[key]> };

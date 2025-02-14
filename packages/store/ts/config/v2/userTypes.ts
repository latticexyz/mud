import { mapObject } from "@latticexyz/common/utils";
import { UserTypes } from "./output";
import { isSchemaAbiType } from "@latticexyz/schema-type/internal";
import { AbiTypeScope, extendScope } from "./scope";
import { hasOwnKey, isObject } from "./generics";

export type extractInternalType<userTypes extends UserTypes> = { [key in keyof userTypes]: userTypes[key]["type"] };

export function extractInternalType<userTypes extends UserTypes>(userTypes: userTypes): extractInternalType<userTypes> {
  const baseTypes = mapObject(userTypes, (userType) => userType.type);
  const arrayTypes = Object.fromEntries(
    Object.entries(baseTypes)
      .map(([key, value]) => [`${key}[]`, `${value}[]`])
      .filter(([_, value]) => isSchemaAbiType(value)),
  );

  return { ...baseTypes, ...arrayTypes };
}

export function isUserTypes(userTypes: unknown): userTypes is UserTypes {
  return isObject(userTypes) && Object.values(userTypes).every((userType) => isSchemaAbiType(userType.type));
}

export type scopeWithUserTypes<userTypes, scope extends AbiTypeScope = AbiTypeScope> = UserTypes extends userTypes
  ? scope
  : userTypes extends UserTypes
    ? extendScope<scope, extractInternalType<userTypes>>
    : scope;

export function scopeWithUserTypes<userTypes, scope extends AbiTypeScope = AbiTypeScope>(
  userTypes: userTypes,
  scope: scope = AbiTypeScope as scope,
): scopeWithUserTypes<userTypes, scope> {
  return (isUserTypes(userTypes) ? extendScope(scope, extractInternalType(userTypes)) : scope) as never;
}

export function validateUserTypes(userTypes: unknown): asserts userTypes is UserTypes {
  if (!isObject(userTypes)) {
    throw new Error(`Expected userTypes, received ${JSON.stringify(userTypes)}`);
  }

  for (const { type } of Object.values(userTypes)) {
    if (!hasOwnKey(AbiTypeScope.types, type)) {
      throw new Error(`"${String(type)}" is not a valid ABI type.`);
    }
  }
}

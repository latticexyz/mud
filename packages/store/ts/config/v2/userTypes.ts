import { mapObject } from "@latticexyz/common/utils";
import { UserTypes } from "./output";
import { isSchemaAbiType } from "@latticexyz/schema-type/internal";
import { AbiTypeScope, extendScope } from "./scope";

export type extractInternalType<userTypes extends UserTypes> = { [key in keyof userTypes]: userTypes[key]["type"] };

export function extractInternalType<userTypes extends UserTypes>(userTypes: userTypes): extractInternalType<userTypes> {
  return mapObject(userTypes, (userType) => userType.type);
}

export function isUserTypes(userTypes: unknown): userTypes is UserTypes {
  return (
    typeof userTypes === "object" &&
    userTypes != null &&
    Object.values(userTypes).every((userType) => isSchemaAbiType(userType.type))
  );
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
  return (isUserTypes(userTypes) ? extendScope(scope, extractInternalType(userTypes)) : scope) as scopeWithUserTypes<
    userTypes,
    scope
  >;
}

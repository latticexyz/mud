import { SchemaType } from "@latticexyz/schema-type";
import path from "path";
import { StoreConfig } from "../index.js";

export type UserTypeDetails = ReturnType<typeof getUserTypeDetails>;

/**
 * Resolve a SchemaType|userType into a general type info object
 */
export function resolveSchemaOrUserType(
  type: SchemaType | string,
  usedInDirectory: string,
  userTypesConfig: StoreConfig["userTypes"]
) {
  let schemaType;
  let userTypeDetails;
  if (typeof type === "string") {
    userTypeDetails = getUserTypeDetails(type, usedInDirectory, userTypesConfig);
    schemaType = userTypeDetails.schemaType;
  } else {
    schemaType = type;
  }

  return {
    schemaType,
    userTypeDetails,
  };
}

/**
 * Get all the necessary rendering details for the user type
 */
export function getUserTypeDetails(
  userType: string,
  usedInDirectory: string,
  userTypesConfig: StoreConfig["userTypes"]
) {
  // Relative import path for this type.
  // "./" must be added because path stripts it,
  // but solidity expects it unless there's "../" ("./../" is fine)
  const importPath = "./" + path.relative(usedInDirectory, userTypesConfig.path);

  if (userType in userTypesConfig.enums) {
    const renderCastFrom = (arg: string) => `${userType}.unwrap(${arg})`;
    const renderCastTo = (arg: string) => `${userType}.wrap(${arg})`;

    return {
      importPath,
      userType,
      schemaType: SchemaType.UINT8,
      renderCastFrom,
      renderCastTo,
    };
  } else {
    throw new Error(`User type "${userType}" does not exist`);
  }
}

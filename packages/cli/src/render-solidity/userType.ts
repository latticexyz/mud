import { getStaticByteLength, SchemaType, SchemaTypeId } from "@latticexyz/schema-type";
import { StoreConfig } from "../index.js";
import { ImportDatum, RenderTableType } from "./types.js";

export type UserTypeInfo = ReturnType<typeof getUserTypeInfo>;

/**
 * Resolve a SchemaType|userType into a SchemaType
 */
export function resolveSchemaOrUserType(
  schemaOrUserType: SchemaType | string,
  userTypesConfig: StoreConfig["userTypes"]
) {
  if (typeof schemaOrUserType === "string") {
    const { schemaType, renderTableType } = getUserTypeInfo(schemaOrUserType, userTypesConfig);
    return { schemaType, renderTableType };
  } else {
    return {
      schemaType: schemaOrUserType,
      renderTableType: getSchemaTypeInfo(schemaOrUserType),
    };
  }
}

/**
 * Get the required import for SchemaType|userType (`undefined` means that no import is required)
 */
export function importForSchemaOrUserType(
  schemaOrUserType: SchemaType | string,
  usedInDirectory: string,
  userTypesConfig: StoreConfig["userTypes"]
): ImportDatum | undefined {
  if (typeof schemaOrUserType === "string") {
    return {
      symbol: schemaOrUserType,
      fromPath: userTypesConfig.path + ".sol",
      usedInPath: usedInDirectory,
    };
  } else {
    return undefined;
  }
}

export function getSchemaTypeInfo(schemaType: SchemaType): RenderTableType {
  const staticByteLength = getStaticByteLength(schemaType);
  const isDynamic = staticByteLength === 0;
  const typeId = SchemaTypeId[schemaType];
  return {
    typeId,
    typeWithLocation: isDynamic ? typeId + " memory" : typeId,
    enumName: SchemaType[schemaType],
    staticByteLength,
    isDynamic,
    typeWrap: "",
    typeUnwrap: "",
    internalTypeId: typeId,
  };
}

export function getUserTypeInfo(
  userType: string,
  userTypesConfig: StoreConfig["userTypes"]
): {
  schemaType: SchemaType;
  renderTableType: RenderTableType;
} {
  if (userType in userTypesConfig.enums) {
    const schemaType = SchemaType.UINT8;
    const staticByteLength = getStaticByteLength(schemaType);
    const isDynamic = staticByteLength === 0;
    const typeId = userType;
    return {
      schemaType,
      renderTableType: {
        typeId,
        typeWithLocation: typeId,
        enumName: SchemaType[schemaType],
        staticByteLength,
        isDynamic,
        typeWrap: `${userType}`,
        typeUnwrap: `${userType}`,
        internalTypeId: `${SchemaTypeId[schemaType]}`,
      },
    };
  } else {
    throw new Error(`User type "${userType}" does not exist`);
  }
}

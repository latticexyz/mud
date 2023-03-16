import { getStaticByteLength, SchemaType, SchemaTypeToAbiType } from "@latticexyz/schema-type";
import path from "path";
import { StoreConfig } from "../index.js";
import { RenderTableType } from "./types.js";

export type UserTypeInfo = ReturnType<typeof getUserTypeInfo>;

/**
 * Resolve a SchemaType|userType into a SchemaType
 */
export function resolveSchemaOrUserTypeSimple(
  schemaOrUserType: SchemaType | string,
  userTypesConfig: StoreConfig["userTypes"]
) {
  if (typeof schemaOrUserType === "string") {
    const { schemaType } = getUserTypeInfo(schemaOrUserType, userTypesConfig);
    return schemaType;
  } else {
    return schemaOrUserType;
  }
}

/**
 * Resolve a SchemaType|userType into RenderTableType, required import, and internal SchemaType
 */
export function resolveSchemaOrUserType(
  schemaOrUserType: SchemaType | string,
  srcDirectory: string,
  usedInDirectory: string,
  userTypesConfig: StoreConfig["userTypes"]
) {
  if (typeof schemaOrUserType === "string") {
    // Relative import path for this type.
    // "./" must be added because path stripts it,
    // but solidity expects it unless there's "../" ("./../" is fine)
    const importedFromPath = path.join(srcDirectory, userTypesConfig.path);
    const importDatum = {
      symbol: schemaOrUserType,
      path: "./" + path.relative(usedInDirectory, importedFromPath) + ".sol",
    };
    const { schemaType, renderTableType } = getUserTypeInfo(schemaOrUserType, userTypesConfig);
    return {
      importDatum,
      renderTableType,
      schemaType,
    };
  } else {
    return {
      importDatum: undefined,
      renderTableType: getSchemaTypeInfo(schemaOrUserType),
      schemaType: schemaOrUserType,
    };
  }
}

export function getSchemaTypeInfo(schemaType: SchemaType): RenderTableType {
  const staticByteLength = getStaticByteLength(schemaType);
  const isDynamic = staticByteLength === 0;
  const typeId = SchemaTypeToAbiType[schemaType];
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
        internalTypeId: `${SchemaTypeToAbiType[schemaType]}`,
      },
    };
  } else {
    throw new Error(`User type "${userType}" does not exist`);
  }
}

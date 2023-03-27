import { AbiTypeToSchemaType, getStaticByteLength, SchemaType, SchemaTypeToAbiType } from "@latticexyz/schema-type";
import { StoreConfig } from "../config/index.js";
import { ImportDatum, RenderTableType } from "./types.js";
import { parseStaticArray } from "../config/validation.js";

export type UserTypeInfo = ReturnType<typeof getUserTypeInfo>;

/**
 * Resolve an abi or user type into a SchemaType
 */
export function resolveAbiOrUserType(
  abiOrUserType: string,
  config: StoreConfig
): {
  schemaType: SchemaType;
  renderTableType: RenderTableType;
} {
  // abi types which directly mirror a SchemaType
  if (abiOrUserType in AbiTypeToSchemaType) {
    const schemaType = AbiTypeToSchemaType[abiOrUserType];
    return {
      schemaType,
      renderTableType: getSchemaTypeInfo(schemaType),
    };
  }
  // static arrays
  const staticArray = parseStaticArray(abiOrUserType);
  if (staticArray) {
    if (staticArray.elementType in AbiTypeToSchemaType) {
      return getStaticArrayTypeInfo(abiOrUserType, staticArray.elementType, staticArray.staticLength);
    } else {
      throw new Error("Static arrays of user types are not supported");
    }
  }
  // user types
  return getUserTypeInfo(abiOrUserType, config);
}

/**
 * Get the required import for SchemaType|userType (`undefined` means that no import is required)
 */
export function importForAbiOrUserType(
  abiOrUserType: string,
  usedInDirectory: string,
  config: StoreConfig
): ImportDatum | undefined {
  // abi types which directly mirror a SchemaType
  if (abiOrUserType in AbiTypeToSchemaType) {
    return undefined;
  }
  // static arrays
  const staticArray = parseStaticArray(abiOrUserType);
  if (staticArray) {
    return undefined;
  }
  // user types
  return {
    symbol: abiOrUserType,
    fromPath: config.userTypesPath + ".sol",
    usedInPath: usedInDirectory,
  };
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
  config: StoreConfig
): {
  schemaType: SchemaType;
  renderTableType: RenderTableType;
} {
  // enums
  if (userType in config.enums) {
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
        typeUnwrap: `uint8`,
        internalTypeId: `${SchemaTypeToAbiType[schemaType]}`,
      },
    };
  }
  // invalid
  throw new Error(`User type "${userType}" does not exist`);
}

function getStaticArrayTypeInfo(abiType: string, elementType: string, staticLength: number) {
  const internalTypeId = elementType + "[]";
  const schemaType = AbiTypeToSchemaType[internalTypeId];
  return {
    schemaType,
    renderTableType: {
      typeId: abiType,
      typeWithLocation: `${abiType} memory`,
      enumName: SchemaType[schemaType],
      staticByteLength: 0,
      isDynamic: true,
      typeWrap: `toStaticArray_${elementType}_${staticLength}`,
      typeUnwrap: `fromStaticArray_${elementType}_${staticLength}`,
      typeWrappingData: {
        kind: "staticArray",
        elementType,
        staticLength,
      },
      internalTypeId,
    },
  } as const;
}

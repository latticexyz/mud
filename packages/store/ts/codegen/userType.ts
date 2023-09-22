import {
  AbiTypeToSchemaType,
  getStaticByteLength,
  SchemaType,
  SchemaTypeToAbiType,
} from "@latticexyz/schema-type/deprecated";
import { parseStaticArray } from "@latticexyz/config";
import { ImportDatum, RenderType, SolidityUserDefinedType } from "@latticexyz/common/codegen";
import { StoreConfig } from "../config";

export type UserTypeInfo = ReturnType<typeof getUserTypeInfo>;

/**
 * Resolve an abi or user type into a SchemaType and RenderType
 */
export function resolveAbiOrUserType(
  abiOrUserType: string,
  config: StoreConfig,
  solidityUserTypes: Record<string, SolidityUserDefinedType>
): {
  schemaType: SchemaType;
  renderType: RenderType;
} {
  // abi types which directly mirror a SchemaType
  if (abiOrUserType in AbiTypeToSchemaType) {
    const schemaType = AbiTypeToSchemaType[abiOrUserType];
    return {
      schemaType,
      renderType: getSchemaTypeInfo(schemaType),
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
  return getUserTypeInfo(abiOrUserType, config, solidityUserTypes);
}

/**
 * Get the required import for SchemaType|userType (`undefined` means that no import is required)
 */
export function importForAbiOrUserType(
  abiOrUserType: string,
  usedInDirectory: string,
  config: StoreConfig,
  solidityUserTypes: Record<string, SolidityUserDefinedType>
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
  // user-defined types in a user-provided file
  if (abiOrUserType in solidityUserTypes) {
    // these types can have a library name as their import symbol
    const solidityUserType = solidityUserTypes[abiOrUserType];
    const symbol = solidityUserType.importSymbol;
    if (solidityUserType.isRelativePath) {
      return {
        symbol,
        fromPath: solidityUserType.fromPath,
        usedInPath: usedInDirectory,
      };
    } else {
      return {
        symbol,
        path: solidityUserType.fromPath,
      };
    }
  }
  // other user types
  return {
    symbol: abiOrUserType,
    fromPath: config.userTypesFilename,
    usedInPath: usedInDirectory,
  };
}

export function getSchemaTypeInfo(schemaType: SchemaType): RenderType {
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
  config: StoreConfig,
  solidityUserTypes: Record<string, SolidityUserDefinedType>
): {
  schemaType: SchemaType;
  renderType: RenderType;
} {
  // enums
  if (userType in config.enums) {
    const schemaType = SchemaType.UINT8;
    const staticByteLength = getStaticByteLength(schemaType);
    const isDynamic = staticByteLength === 0;
    const typeId = userType;
    return {
      schemaType,
      renderType: {
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
  // user-defined types
  if (userType in solidityUserTypes) {
    if (!(userType in solidityUserTypes)) {
      throw new Error(`User type "${userType}" not found in MUD config`);
    }
    const solidityUserType = solidityUserTypes[userType];
    const typeId = solidityUserType.typeId;
    const schemaType = AbiTypeToSchemaType[solidityUserType.internalTypeId];
    return {
      schemaType,
      renderType: {
        typeId,
        typeWithLocation: typeId,
        enumName: SchemaType[schemaType],
        staticByteLength: getStaticByteLength(schemaType),
        isDynamic: false,
        typeWrap: `${typeId}.wrap`,
        typeUnwrap: `${typeId}.unwrap`,
        internalTypeId: `${solidityUserType.internalTypeId}`,
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
    renderType: {
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

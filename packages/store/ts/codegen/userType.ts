import {
  AbiTypeToSchemaType,
  getStaticByteLength,
  SchemaType,
  SchemaTypeToAbiType,
} from "@latticexyz/schema-type/deprecated";
import { RenderType } from "@latticexyz/common/codegen";
import { UserType } from "./getUserTypes";

function parseStaticArray(abiType: string) {
  const matches = abiType.match(/^(\w+)\[(\d+)\]$/);
  if (!matches) return null;
  return {
    elementType: matches[1],
    staticLength: Number.parseInt(matches[2]),
  };
}

function parseDynamicArray(abiType: string) {
  const matches = abiType.match(/^(\w+)\[\]$/);
  if (!matches) return null;
  return {
    elementType: matches[1],
  };
}

/**
 * Resolve an abi or user type into a SchemaType and RenderType
 */
export function resolveAbiOrUserType(
  abiOrUserType: string,
  userTypes: readonly UserType[],
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
  const dynamicArray = parseDynamicArray(abiOrUserType);
  if (dynamicArray) {
    // Handle user type dynamic arrays
    const elementUserType = userTypes.find((type) => type.name === dynamicArray.elementType);
    if (!elementUserType) {
      throw new Error(`User type "${dynamicArray.elementType}" not found`);
    }
    const userType = getUserTypeInfo(elementUserType);
    const schemaType = AbiTypeToSchemaType[`${elementUserType.abiType}[]`];
    const typeId = `${elementUserType.name}[]`;
    console.log(userType.renderType.enumName);
    return {
      schemaType,
      renderType: {
        typeId,
        typeWithLocation: `${typeId} memory`,
        enumName: SchemaType[schemaType],
        staticByteLength: 0,
        isDynamic: true,
        typeWrap: "castTo",
        typeUnwrap: "castFrom",
        internalTypeId: `${elementUserType.abiType}[]`,
      },
    };
  }

  const userType = userTypes.find((type) => type.name === abiOrUserType);
  if (!userType) {
    throw new Error(`User type "${abiOrUserType}" not found`);
  }
  return getUserTypeInfo(userType);
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

export function getUserTypeInfo(userType: UserType): {
  schemaType: SchemaType;
  renderType: RenderType;
} {
  switch (userType.type) {
    case "enum": {
      const schemaType = SchemaType.UINT8;
      const staticByteLength = getStaticByteLength(schemaType);
      const isDynamic = staticByteLength === 0;
      return {
        schemaType,
        renderType: {
          typeId: userType.name,
          typeWithLocation: userType.name,
          enumName: SchemaType[schemaType],
          staticByteLength,
          isDynamic,
          typeWrap: userType.name,
          typeUnwrap: userType.abiType,
          internalTypeId: userType.abiType,
        },
      };
    }
    case "userType": {
      const schemaType = AbiTypeToSchemaType[userType.abiType];
      return {
        schemaType,
        renderType: {
          typeId: userType.name,
          typeWithLocation: userType.name,
          enumName: SchemaType[schemaType],
          staticByteLength: getStaticByteLength(schemaType),
          isDynamic: false,
          typeWrap: `${userType.name}.wrap`,
          typeUnwrap: `${userType.name}.unwrap`,
          internalTypeId: userType.abiType,
        },
      };
    }
  }
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

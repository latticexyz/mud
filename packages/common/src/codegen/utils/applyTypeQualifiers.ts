import { QualifiedSymbol } from "./contractToInterface";

/**
 * Apply type qualifiers to function parameters or return types
 * @param params Array of parameter strings (e.g., ["uint256 value", "SomeStruct memory data"])
 * @param qualifiedSymbols Map of symbols to their qualified forms
 * @returns Array of parameters with qualified types applied
 */
export function applyTypeQualifiers(params: string[], qualifiedSymbols?: Map<string, QualifiedSymbol>): string[] {
  if (!qualifiedSymbols || qualifiedSymbols.size === 0) {
    return params;
  }

  return params.map((param) => {
    // Split parameter into parts (e.g., "SomeStruct memory myParam" -> ["SomeStruct", "memory", "myParam"])
    const parts = param.trim().split(/\s+/);
    if (parts.length === 0) return param;

    const type = parts[0];

    // Check if this is an array type
    const arrayMatch = type.match(/^(.+?)(\[\]|\[\d+\])$/);
    if (arrayMatch) {
      const baseType = arrayMatch[1];
      const arraySuffix = arrayMatch[2];

      // Check if base type needs qualification
      const qualified = qualifiedSymbols.get(baseType);
      if (qualified?.qualifier) {
        const qualifiedType = `${qualified.qualifier}.${baseType}${arraySuffix}`;
        parts[0] = qualifiedType;
        return parts.join(" ");
      }
    } else {
      // Check if type needs qualification
      const qualified = qualifiedSymbols.get(type);
      if (qualified?.qualifier) {
        parts[0] = `${qualified.qualifier}.${type}`;
        return parts.join(" ");
      }
    }

    return param;
  });
}

/**
 * Apply type qualifiers to a map of symbols to their qualified names
 * This is a simpler version for when you just need string-to-string mapping
 * @param params Array of parameter strings
 * @param typeQualifiers Map of type names to their qualified forms (e.g., "SomeStruct" -> "IParent.SomeStruct")
 * @returns Array of parameters with qualified types applied
 */
export function applySimpleTypeQualifiers(params: string[], typeQualifiers?: Map<string, string>): string[] {
  if (!typeQualifiers || typeQualifiers.size === 0) {
    return params;
  }

  return params.map((param) => {
    // Split parameter into parts (e.g., "SomeStruct memory myParam" -> ["SomeStruct", "memory", "myParam"])
    const parts = param.trim().split(/\s+/);
    if (parts.length === 0) return param;

    const type = parts[0];

    // Check if this is an array type
    const arrayMatch = type.match(/^(.+?)(\[\]|\[\d+\])$/);
    if (arrayMatch) {
      const baseType = arrayMatch[1];
      const arraySuffix = arrayMatch[2];

      // Check if base type needs qualification
      if (typeQualifiers.has(baseType)) {
        const qualifiedType = typeQualifiers.get(baseType) + arraySuffix;
        parts[0] = qualifiedType;
        return parts.join(" ");
      }
    } else {
      // Check if type needs qualification
      if (typeQualifiers.has(type)) {
        parts[0] = typeQualifiers.get(type)!;
        return parts.join(" ");
      }
    }

    return param;
  });
}

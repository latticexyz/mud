import { parse, visit } from "@solidity-parser/parser";
import { MUDError } from "../../errors";

export interface SolidityUserDefinedType {
  /** Fully-qualified name of the user-defined type (may include a library name as prefix) */
  typeId: string;
  /** Name of the wrapped primitive type */
  internalTypeId: string;
  /** Symbol which must be imported to use the type (either the type name, or the library name where the type is defined) */
  importSymbol: string;
  /** Path to the solidity file which contains the user type */
  fromPath: string;
  /** Whether `fromPath` is relative  */
  isRelativePath: boolean;
}

/**
 * Parse the solidity data to extract user-defined type information.
 * @param data contents of a solidity file with the user types declarations
 * @param userTypeNames names of the user types to extract
 * @param fromPath path to the solidity file from which the user types are extracted
 * @returns record of type names mapped to the extracted type information
 */
export function extractUserTypes(
  data: string,
  userTypeNames: string[],
  fromPath: string,
): Record<string, SolidityUserDefinedType> {
  const ast = parse(data);

  const isRelativePath = fromPath.at(0) === ".";
  const userDefinedTypes: Record<string, SolidityUserDefinedType> = {};

  visit(ast, {
    TypeDefinition({ name, definition }, parent) {
      if (definition.name.includes("fixed")) throw new MUDError(`Fixed point numbers are not supported by MUD`);
      if (userTypeNames.includes(name)) {
        if (name in userDefinedTypes) {
          throw new MUDError(`File has multiple user types with the same name: ${name}`);
        }

        if (parent?.type === "ContractDefinition") {
          userDefinedTypes[name] = {
            typeId: `${parent.name}.${name}`,
            internalTypeId: definition.name,
            importSymbol: parent.name,
            fromPath,
            isRelativePath,
          };
        } else {
          userDefinedTypes[name] = {
            typeId: name,
            internalTypeId: definition.name,
            importSymbol: name,
            fromPath,
            isRelativePath,
          };
        }
      }
    },
  });

  return userDefinedTypes;
}

import { parse, visit } from "@solidity-parser/parser";
import { MUDError } from "../../errors";

export interface SolidityUserDefinedType {
  typeId: string;
  internalTypeId: string;
  importSymbol: string;
  fromPath: string;
  isRelativePath: boolean;
}

/**
 * Parse the solidity data to extract user-defined type information.
 * @param data contents of a solidity file with the user types declarations
 * @param userTypeNames names of the user types to extract
 */
export function extractUserTypes(
  data: string,
  userTypeNames: string[],
  fromPath: string
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

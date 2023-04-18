import { parse, visit } from "@solidity-parser/parser";
import { TypeName, VariableDeclaration } from "@solidity-parser/parser/dist/src/ast-types.js";
import { MUDError } from "@latticexyz/config";

export interface ContractInterfaceFunction {
  name: string;
  parameters: string[];
  stateMutability: string;
  returnParameters: string[];
}

/**
 * Parse the contract data to get the functions necessary to generate an interface,
 * and symbols to import from the original contract.
 * @param data contents of a file with the solidity contract
 * @param contractName name of the contract
 * @returns interface data
 */
export function contractToInterface(data: string, contractName: string) {
  const ast = parse(data);

  let withContract = false;
  let symbols: string[] = [];
  const functions: ContractInterfaceFunction[] = [];

  visit(ast, {
    ContractDefinition({ name }) {
      if (name === contractName) {
        withContract = true;
      }
    },
    FunctionDefinition(
      { name, visibility, parameters, stateMutability, returnParameters, isConstructor, isFallback, isReceiveEther },
      parent
    ) {
      if (parent !== undefined && parent.type === "ContractDefinition" && parent.name === contractName) {
        try {
          // skip constructor and fallbacks
          if (isConstructor || isFallback || isReceiveEther) return;
          // forbid default visibility (this check might be unnecessary, modern solidity already disallows this)
          if (visibility === "default") throw new MUDError(`Visibility is not specified`);

          if (visibility === "external" || visibility === "public") {
            functions.push({
              name: name === null ? "" : name,
              parameters: parameters.map(parseParameter),
              stateMutability: stateMutability || "",
              returnParameters: returnParameters === null ? [] : returnParameters.map(parseParameter),
            });

            for (const { typeName } of parameters.concat(returnParameters ?? [])) {
              symbols = symbols.concat(typeNameToExternalSymbols(typeName));
            }
          }
        } catch (error: unknown) {
          if (error instanceof MUDError) {
            error.message = `Function "${name}" in contract "${contractName}": ${error.message}`;
          }
          throw error;
        }
      }
    },
  });

  if (!withContract) {
    throw new MUDError(`Contract not found: ${contractName}`);
  }

  return {
    functions,
    symbols,
  };
}

function parseParameter({ name, typeName, storageLocation }: VariableDeclaration): string {
  let typedNameWithLocation = "";

  const { name: flattenedTypeName, stateMutability } = flattenTypeName(typeName);
  // type name (e.g. uint256)
  typedNameWithLocation += flattenedTypeName;
  // optional mutability (e.g. address payable)
  if (stateMutability !== null) {
    typedNameWithLocation += ` ${stateMutability}`;
  }
  // location, when relevant (e.g. string memory)
  if (storageLocation !== null) {
    typedNameWithLocation += ` ${storageLocation}`;
  }
  // optional variable name
  if (name !== null) {
    typedNameWithLocation += ` ${name}`;
  }

  return typedNameWithLocation;
}

function flattenTypeName(typeName: TypeName | null): { name: string; stateMutability: string | null } {
  if (typeName === null) {
    return {
      name: "",
      stateMutability: null,
    };
  }
  if (typeName.type === "ElementaryTypeName") {
    return {
      name: typeName.name,
      stateMutability: typeName.stateMutability,
    };
  } else if (typeName.type === "UserDefinedTypeName") {
    return {
      name: typeName.namePath,
      stateMutability: null,
    };
  } else if (typeName.type === "ArrayTypeName") {
    const length = typeName.length?.type === "NumberLiteral" ? typeName.length.number : "";
    const { name, stateMutability } = flattenTypeName(typeName.baseTypeName);
    return {
      name: `${name}[${length}]`,
      stateMutability,
    };
  } else {
    // TODO function types are unsupported but could be useful
    throw new MUDError(`Invalid typeName.type ${typeName.type}`);
  }
}

// Get symbols that need to be imported for given typeName
function typeNameToExternalSymbols(typeName: TypeName | null): string[] {
  if (typeName?.type === "UserDefinedTypeName") {
    // split is needed to get a library, if types are internal to it
    const symbol = typeName.namePath.split(".")[0];
    return [symbol];
  } else if (typeName?.type === "ArrayTypeName") {
    return typeNameToExternalSymbols(typeName.baseTypeName);
  } else {
    return [];
  }
}

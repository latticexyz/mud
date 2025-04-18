import { parse, visit } from "@solidity-parser/parser";
import type { SourceUnit, TypeName, VariableDeclaration } from "@solidity-parser/parser/dist/src/ast-types";
import { MUDError } from "../../errors";
import { findContractNode } from "./findContractNode";
import { SymbolImport, findSymbolImport } from "./findSymbolImport";

export interface ContractInterfaceFunction {
  name: string;
  parameters: string[];
  stateMutability: string;
  returnParameters: string[];
}

export interface ContractInterfaceError {
  name: string;
  parameters: string[];
}

/**
 * Parse the contract data to get the functions necessary to generate an interface,
 * and symbols to import from the original contract.
 * @param source contents of a file with the solidity contract
 * @param contractName name of the contract
 * @returns interface data
 */
export function contractToInterface(
  source: string,
  contractName: string,
): {
  functions: ContractInterfaceFunction[];
  errors: ContractInterfaceError[];
  symbolImports: SymbolImport[];
} {
  const ast = parse(source);
  const contractNode = findContractNode(ast, contractName);
  let symbolImports: SymbolImport[] = [];
  const functions: ContractInterfaceFunction[] = [];
  const errors: ContractInterfaceError[] = [];

  if (!contractNode) {
    throw new MUDError(`Contract not found: ${contractName}`);
  }

  visit(contractNode, {
    FunctionDefinition({
      name,
      visibility,
      parameters,
      stateMutability,
      returnParameters,
      isConstructor,
      isFallback,
      isReceiveEther,
    }) {
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
            const symbols = typeNameToSymbols(typeName);
            symbolImports = symbolImports.concat(symbolsToImports(ast, symbols));
          }
        }
      } catch (error: unknown) {
        if (error instanceof MUDError) {
          error.message = `Function "${name}" in contract "${contractName}": ${error.message}`;
        }
        throw error;
      }
    },
    CustomErrorDefinition({ name, parameters }) {
      errors.push({
        name,
        parameters: parameters.map(parseParameter),
      });

      for (const parameter of parameters) {
        const symbols = typeNameToSymbols(parameter.typeName);
        symbolImports = symbolImports.concat(symbolsToImports(ast, symbols));
      }
    },
  });

  return {
    functions,
    errors,
    symbolImports,
  };
}

function parseParameter({ name, typeName, storageLocation }: VariableDeclaration): string {
  let typedNameWithLocation = "";

  // type name (e.g. uint256)
  typedNameWithLocation += flattenTypeName(typeName);
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

function flattenTypeName(typeName: TypeName | null): string {
  if (typeName === null) {
    return "";
  }
  if (typeName.type === "ElementaryTypeName") {
    if (typeName.stateMutability !== null) {
      // for elementary types mutability can only be `payable`, and should be part of the elementary type name
      // meaning that `address payable[]` is correct, not `address[] payable`
      return `${typeName.name} ${typeName.stateMutability}`;
    } else {
      return typeName.name;
    }
  } else if (typeName.type === "UserDefinedTypeName") {
    return typeName.namePath;
  } else if (typeName.type === "ArrayTypeName") {
    let length = "";
    if (typeName.length?.type === "NumberLiteral") {
      length = typeName.length.number;
    } else if (typeName.length?.type === "Identifier") {
      length = typeName.length.name;
    }

    const name = flattenTypeName(typeName.baseTypeName);
    return `${name}[${length}]`;
  } else {
    // TODO function types are unsupported but could be useful
    throw new MUDError(`Invalid typeName.type ${typeName.type}`);
  }
}

// Get symbols that need to be imported for given typeName
function typeNameToSymbols(typeName: TypeName | null): string[] {
  if (typeName?.type === "UserDefinedTypeName") {
    // split is needed to get a library, if types are internal to it
    const symbol = typeName.namePath.split(".")[0];
    return [symbol];
  } else if (typeName?.type === "ArrayTypeName") {
    const symbols = typeNameToSymbols(typeName.baseTypeName);
    // array types can also use symbols (constants) for length
    if (typeName.length?.type === "Identifier") {
      const innerTypeName = typeName.length.name;
      symbols.push(innerTypeName.split(".")[0]);
    }
    return symbols;
  } else {
    return [];
  }
}

function symbolsToImports(ast: SourceUnit, symbols: string[]): SymbolImport[] {
  return symbols.map((symbol) => {
    const symbolImport = findSymbolImport(ast, symbol);
    if (!symbolImport) throw new MUDError(`Symbol "${symbol}" has no explicit import`);
    return symbolImport;
  });
}

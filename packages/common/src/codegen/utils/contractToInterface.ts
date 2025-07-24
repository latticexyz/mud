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

export interface QualifiedSymbol {
  symbol: string;
  qualifier?: string; // e.g., "IParentContract" for IParentContract.SomeStruct
  sourcePath: string;
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
  findInheritedSymbol?: (symbol: string) => QualifiedSymbol | undefined,
): {
  functions: ContractInterfaceFunction[];
  errors: ContractInterfaceError[];
  symbolImports: SymbolImport[];
  qualifiedSymbols: Map<string, QualifiedSymbol>;
} {
  let ast: SourceUnit;
  try {
    ast = parse(source);
  } catch (error) {
    throw new MUDError(`Failed to parse contract ${contractName}: ${error}`);
  }
  const contractNode = findContractNode(ast, contractName);
  let symbolImports: SymbolImport[] = [];
  const functions: ContractInterfaceFunction[] = [];
  const errors: ContractInterfaceError[] = [];
  const qualifiedSymbols = new Map<string, QualifiedSymbol>();

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
            symbolImports = symbolImports.concat(symbolsToImports(ast, symbols, findInheritedSymbol, qualifiedSymbols));
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
        symbolImports = symbolImports.concat(symbolsToImports(ast, symbols, findInheritedSymbol, qualifiedSymbols));
      }
    },
  });

  return {
    functions,
    errors,
    symbolImports,
    qualifiedSymbols,
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
    let length = "";
    if (typeName.length?.type === "NumberLiteral") {
      length = typeName.length.number;
    } else if (typeName.length?.type === "Identifier") {
      length = typeName.length.name;
    }

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

function symbolsToImports(
  ast: SourceUnit,
  symbols: string[],
  findInheritedSymbol?: (symbol: string) => QualifiedSymbol | undefined,
  qualifiedSymbols?: Map<string, QualifiedSymbol>,
): SymbolImport[] {
  const imports: SymbolImport[] = [];

  for (const symbol of symbols) {
    // First check explicit imports
    const explicitImport = findSymbolImport(ast, symbol);
    if (explicitImport) {
      imports.push(explicitImport);
      continue;
    }

    // Then check inherited symbols
    if (findInheritedSymbol) {
      const inheritedSymbol = findInheritedSymbol(symbol);
      if (inheritedSymbol) {
        // Track qualified symbol
        if (qualifiedSymbols) {
          qualifiedSymbols.set(symbol, inheritedSymbol);
        }
        // Add import for the parent contract if it has a qualifier
        if (inheritedSymbol.qualifier) {
          imports.push({
            symbol: inheritedSymbol.qualifier,
            path: inheritedSymbol.sourcePath,
          });
        }
      }
    }
  }

  // Deduplicate imports
  const uniqueImports = new Map<string, SymbolImport>();
  for (const imp of imports) {
    const key = `${imp.symbol}:${imp.path}`;
    if (!uniqueImports.has(key)) {
      uniqueImports.set(key, imp);
    }
  }

  return Array.from(uniqueImports.values());
}

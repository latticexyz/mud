import { parse, visit } from "@solidity-parser/parser";
import type { SourceUnit, TypeName, VariableDeclaration } from "@solidity-parser/parser/dist/src/ast-types";
import { MUDError } from "../../errors";

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

interface SymbolImport {
  symbol: string;
  path: string;
}

/**
 * Parse the contract data to get the functions necessary to generate an interface,
 * and symbols to import from the original contract.
 * @param data contents of a file with the solidity contract
 * @param contractName name of the contract
 * @returns interface data
 */
export function contractToInterface(
  data: string,
  contractName: string
): {
  functions: ContractInterfaceFunction[];
  errors: ContractInterfaceError[];
  symbolImports: SymbolImport[];
} {
  const ast = parse(data);

  let withContract = false;
  let symbolImports: SymbolImport[] = [];
  const functions: ContractInterfaceFunction[] = [];
  const errors: ContractInterfaceError[] = [];

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
      }
    },
    CustomErrorDefinition({ name, parameters }) {
      errors.push({
        name: name === null ? "" : name,
        parameters: parameters.map(parseParameter),
      });

      for (const parameter of parameters) {
        const symbols = typeNameToSymbols(parameter.typeName);
        symbolImports = symbolImports.concat(symbolsToImports(ast, symbols));
      }
    },
  });

  if (!withContract) {
    throw new MUDError(`Contract not found: ${contractName}`);
  }

  return {
    functions,
    errors,
    symbolImports,
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

// Get imports for given symbols.
// To avoid circular dependencies of interfaces on their implementations,
// symbols used for args/returns must always be imported from an auxiliary file.
// To avoid parsing the entire project to build dependencies,
// symbols must be imported with an explicit `import { symbol } from ...`
function symbolsToImports(ast: SourceUnit, symbols: string[]): SymbolImport[] {
  const imports: SymbolImport[] = [];

  for (const symbol of symbols) {
    let symbolImport: SymbolImport | undefined;

    visit(ast, {
      ImportDirective({ path, symbolAliases }) {
        if (symbolAliases) {
          for (const symbolAndAlias of symbolAliases) {
            // either check the alias, or the original symbol if there's no alias
            const symbolAlias = symbolAndAlias[1] || symbolAndAlias[0];
            if (symbol === symbolAlias) {
              symbolImport = {
                // always use the original symbol for interface imports
                symbol: symbolAndAlias[0],
                path,
              };
              return;
            }
          }
        }
      },
    });

    if (symbolImport) {
      imports.push(symbolImport);
    } else {
      throw new MUDError(`Symbol "${symbol}" has no explicit import`);
    }
  }

  return imports;
}

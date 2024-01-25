import { parse, visit } from "@solidity-parser/parser";
import type {
  ContractDefinition,
  SourceUnit,
  TypeName,
  VariableDeclaration,
} from "@solidity-parser/parser/dist/src/ast-types";
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

export interface ContractInterfaceStruct {
  name: string;
  members: string[];
}

export interface ContractInterfaceEnum {
  name: string;
  members: string[];
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
  structs: ContractInterfaceStruct[];
  enums: ContractInterfaceEnum[];
  symbolImports: SymbolImport[];
} {
  const ast = parse(data);

  const contractNode = findContractNode(parse(data), contractName);
  let symbolImports: SymbolImport[] = [];
  const functions: ContractInterfaceFunction[] = [];
  const errors: ContractInterfaceError[] = [];
  const structs: ContractInterfaceStruct[] = [];
  const enums: ContractInterfaceEnum[] = [];

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
          symbolImports = symbolImports.concat(
            variableDeclarationsToImports(ast, parameters.concat(returnParameters ?? []))
          );
        }
      } catch (error: unknown) {
        if (error instanceof MUDError) {
          throw new MUDError(`Function "${name}" in contract "${contractName}": ${error.message}`);
        }
        throw error;
      }
    },
    CustomErrorDefinition({ name, parameters }) {
      errors.push({
        name,
        parameters: parameters.map(parseParameter),
      });

      symbolImports = symbolImports.concat(variableDeclarationsToImports(ast, parameters));
    },
    StructDefinition({ name, members }) {
      structs.push({
        name,
        members: members.map(parseParameter),
      });

      symbolImports = symbolImports.concat(variableDeclarationsToImports(ast, members));
    },
    EnumDefinition({ name, members }) {
      enums.push({
        name,
        members: members.map(({ name }) => name),
      });
    },
  });

  return {
    functions,
    errors,
    structs,
    enums,
    symbolImports,
  };
}

function findContractNode(ast: SourceUnit, contractName: string): ContractDefinition | undefined {
  let contract = undefined;

  visit(ast, {
    ContractDefinition(node) {
      if (node.name === contractName) {
        contract = node;
      }
    },
  });

  return contract;
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

// Get imports for given VariableDeclaration AST nodes.
function variableDeclarationsToImports(ast: SourceUnit, variableDeclarations: VariableDeclaration[]): SymbolImport[] {
  let imports: SymbolImport[] = [];
  for (const variableDeclaration of variableDeclarations) {
    const symbols = typeNameToSymbols(variableDeclaration.typeName);
    imports = imports.concat(symbolsToImports(ast, symbols));
  }
  return imports;
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

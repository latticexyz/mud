import { MUDError } from "../../errors";
import { findContractOrInterfaceNode } from "./findContractOrInterfaceNode";
import { SymbolImport, findSymbolImport } from "./findSymbolImport";
import { Parser } from "@nomicfoundation/slang/parser";
import { assertNonterminalNode, Cursor, Query, TerminalNode } from "@nomicfoundation/slang/cst";
import {
  ArrayTypeName,
  ErrorDefinition,
  ErrorParametersDeclaration,
  FunctionDefinition,
  IdentifierPath,
  MemberAccessExpression,
  ParametersDeclaration,
  TypeName,
} from "@nomicfoundation/slang/ast";
import { LanguageFacts } from "@nomicfoundation/slang/utils";

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
  const version = LanguageFacts.inferLanguageVersions(source).at(-1);
  const parser = Parser.create(version);
  const parserResult = parser.parseFileContents(source);
  if (!parserResult.isValid()) {
    const errorMessage = parserResult
      .errors()
      .map((error) => error.message)
      .join("\n");
    throw new MUDError(`Failed to parse contract ${contractName}: ${errorMessage}`);
  }
  const root = parserResult.createTreeCursor();
  const contractNode = findContractOrInterfaceNode(root, contractName);
  let symbolImports: SymbolImport[] = [];
  const functions: ContractInterfaceFunction[] = [];
  const errors: ContractInterfaceError[] = [];
  const qualifiedSymbols = new Map<string, QualifiedSymbol>();

  if (!contractNode) {
    throw new MUDError(`Contract not found: ${contractName}`);
  }

  for (const match of contractNode.query([
    Query.create(`
      @function [FunctionDefinition [FunctionName [Identifier]]]
    `),
    Query.create(`
      @error [ErrorDefinition]
    `),
  ])) {
    if (match.captures["function"]) {
      // Functions
      const funcNode = match.captures["function"]?.[0].node;
      assertNonterminalNode(funcNode);
      const funcDef = new FunctionDefinition(funcNode);
      const name = funcDef.name.cst.unparse().trim();

      let visibility = undefined;
      let stateMutability = "";
      for (const item of funcDef.attributes.items) {
        const attribute = item.cst.unparse().trim();
        switch (attribute) {
          case "public":
          case "private":
          case "internal":
          case "external":
            visibility = attribute;
            break;
          case "view":
          case "pure":
          case "payable":
            stateMutability = attribute;
            break;
        }
      }
      if (visibility === undefined) throw new MUDError(`Visibility is not specified for function '${name}'`);
      if (visibility !== "public" && visibility !== "external") {
        continue;
      }

      functions.push({
        name,
        parameters: splatParameters(funcDef.parameters),
        stateMutability,
        returnParameters: splatParameters(funcDef.returns?.variables),
      });

      for (const { typeName } of funcDef.parameters.parameters.items.concat(
        funcDef.returns?.variables.parameters.items ?? [],
      )) {
        const symbols = typeNameToSymbols(typeName);
        symbolImports = symbolImports.concat(symbolsToImports(root, symbols, findInheritedSymbol, qualifiedSymbols));
      }
    } else if (match.captures["error"]) {
      // Custom errors
      const errorNode = match.captures.error?.[0].node;
      assertNonterminalNode(errorNode);
      const errorDef = new ErrorDefinition(errorNode);
      const name = errorDef.name.unparse().trim();
      errors.push({
        name,
        parameters: splatParameters(errorDef.members),
      });

      for (const { typeName } of errorDef.members.parameters.items) {
        const symbols = typeNameToSymbols(typeName);
        symbolImports = symbolImports.concat(symbolsToImports(root, symbols, findInheritedSymbol, qualifiedSymbols));
      }
    }
  }

  symbolImports = deduplicateSymbolImports(symbolImports);

  return {
    functions,
    errors,
    symbolImports,
    qualifiedSymbols,
  };
}

function splatParameters(parameters: ParametersDeclaration | ErrorParametersDeclaration | undefined): string[] {
  return parameters?.parameters.items.map((parameter) => parameter.cst.unparse().trim()) ?? [];
}

// Get symbols that need to be imported for given typeName
function typeNameToSymbols(typeName: TypeName): string[] {
  const typeVariant = typeName.variant;
  if (typeVariant instanceof IdentifierPath) {
    return [typeVariant.items[0].unparse()];
  } else if (typeVariant instanceof ArrayTypeName) {
    const symbols = typeNameToSymbols(typeVariant.operand);
    const indexVariant = typeVariant.index?.variant;
    if (indexVariant instanceof TerminalNode) {
      symbols.push(indexVariant.unparse());
    } else if (indexVariant instanceof MemberAccessExpression) {
      const memberOperandVariant = indexVariant.operand.variant;
      if (memberOperandVariant instanceof TerminalNode) {
        symbols.push(memberOperandVariant.unparse());
      }
    }
    return symbols;
  }
  return [];
}

function symbolsToImports(
  root: Cursor,
  symbols: string[],
  findInheritedSymbol?: (symbol: string) => QualifiedSymbol | undefined,
  qualifiedSymbols?: Map<string, QualifiedSymbol>,
): SymbolImport[] {
  const imports: SymbolImport[] = [];

  for (const symbol of symbols) {
    // First check explicit imports
    const explicitImport = findSymbolImport(root, symbol);
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

  return imports;
}

function deduplicateSymbolImports(imports: SymbolImport[]): SymbolImport[] {
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

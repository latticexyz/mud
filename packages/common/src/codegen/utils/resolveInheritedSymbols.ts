import { parse, visit } from "@solidity-parser/parser";
import type { SourceUnit, ContractDefinition } from "@solidity-parser/parser/dist/src/ast-types";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { findContractNode } from "./findContractNode";
import { QualifiedSymbol } from "./contractToInterface";
import { findSymbolImport } from "./findSymbolImport";

interface InheritanceInfo {
  baseContracts: string[];
  baseContractImports: Map<string, string>; // baseName -> import path
  symbols: Map<string, { type: "struct" | "enum" | "error"; contract: string }>;
  filePath?: string; // Track where this contract was defined
}

/**
 * Creates a resolver function that can find symbols through contract inheritance chains
 * @param contractPath Path to the contract file
 * @param contractName Name of the contract
 * @returns A function that resolves symbols to their qualified forms
 */
export async function createInheritanceResolver(
  contractPath: string,
  contractName: string,
): Promise<(symbol: string) => QualifiedSymbol | undefined> {
  const resolvedContracts = new Map<string, InheritanceInfo>();
  const visitedPaths = new Set<string>();

  async function parseContract(filePath: string, targetContractName?: string): Promise<InheritanceInfo | undefined> {
    // Prevent infinite recursion
    const normalizedPath = path.resolve(filePath);
    if (visitedPaths.has(normalizedPath)) {
      return undefined;
    }
    visitedPaths.add(normalizedPath);

    try {
      const source = await readFile(filePath, "utf8");

      // Try to parse the source
      let ast: SourceUnit;
      try {
        ast = parse(source);
      } catch (parseError) {
        // If parsing fails, log the error and skip this file
        console.warn(`Warning: Failed to parse ${filePath} for inheritance resolution:`, parseError);
        return undefined;
      }

      // If targetContractName is specified, find that specific contract
      // Otherwise, process all contracts in the file
      const contractsToProcess: ContractDefinition[] = [];

      if (targetContractName) {
        const contractNode = findContractNode(ast, targetContractName);
        if (contractNode) {
          contractsToProcess.push(contractNode);
        }
      } else {
        visit(ast, {
          ContractDefinition(node) {
            contractsToProcess.push(node);
          },
        });
      }

      // Process each contract
      for (const contractNode of contractsToProcess) {
        const info: InheritanceInfo = {
          baseContracts: [],
          baseContractImports: new Map(),
          symbols: new Map(),
          filePath: normalizedPath,
        };

        // Extract base contracts
        if (contractNode.baseContracts) {
          for (const base of contractNode.baseContracts) {
            info.baseContracts.push(base.baseName.namePath);
          }
        }

        // Extract symbols defined in this contract
        visit(contractNode, {
          StructDefinition(node) {
            if (node.name) {
              info.symbols.set(node.name, { type: "struct", contract: contractNode.name });
            }
          },
          EnumDefinition(node) {
            if (node.name) {
              info.symbols.set(node.name, { type: "enum", contract: contractNode.name });
            }
          },
          CustomErrorDefinition(node) {
            if (node.name) {
              info.symbols.set(node.name, { type: "error", contract: contractNode.name });
            }
          },
        });

        resolvedContracts.set(contractNode.name, info);

        // Recursively process base contracts
        for (const baseName of info.baseContracts) {
          // First check if it's imported
          const importInfo = findSymbolImport(ast, baseName);
          if (importInfo) {
            // Store the original import path
            info.baseContractImports.set(baseName, importInfo.path);

            const importPath = importInfo.path.startsWith(".")
              ? path.resolve(path.dirname(filePath), importInfo.path)
              : importInfo.path;

            await parseContract(importPath, baseName);
          }
        }
      }

      return targetContractName ? resolvedContracts.get(targetContractName) : undefined;
    } catch (error) {
      // Silently fail if we can't read/parse a file
      return undefined;
    }
  }

  // Parse the main contract and its inheritance chain
  await parseContract(contractPath, contractName);

  // Create the resolver function
  return (symbol: string): QualifiedSymbol | undefined => {
    // Check if symbol is defined in the main contract
    const mainInfo = resolvedContracts.get(contractName);
    if (mainInfo?.symbols.has(symbol)) {
      // Symbol is defined in main contract, no qualification needed
      return {
        symbol,
        sourcePath: contractPath,
      };
    }

    // Search through inheritance chain
    function searchInheritance(currentContract: string, visited: Set<string> = new Set()): QualifiedSymbol | undefined {
      if (visited.has(currentContract)) {
        return undefined;
      }
      visited.add(currentContract);

      const contractInfo = resolvedContracts.get(currentContract);
      if (!contractInfo) {
        return undefined;
      }

      // Check each base contract
      for (const baseName of contractInfo.baseContracts) {
        const baseInfo = resolvedContracts.get(baseName);
        if (baseInfo?.symbols.has(symbol)) {
          // Found the symbol in a base contract
          // Get the import path from the main contract to this base contract
          const importPath = mainInfo?.baseContractImports.get(baseName) || `./${baseName}.sol`;

          return {
            symbol,
            qualifier: baseName,
            sourcePath: importPath,
          };
        }

        // Recursively search in base's bases
        const result = searchInheritance(baseName, visited);
        if (result) {
          return result;
        }
      }

      return undefined;
    }

    return searchInheritance(contractName);
  };
}

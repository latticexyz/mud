import { visit } from "@solidity-parser/parser";
import type { ContractDefinition, SourceUnit } from "@solidity-parser/parser/dist/src/ast-types";

export function findContractNode(ast: SourceUnit, contractName: string): ContractDefinition | undefined {
  let contract: ContractDefinition | undefined = undefined;

  visit(ast, {
    ContractDefinition(node) {
      if (node.name === contractName) {
        contract = node;
      }
    },
  });

  return contract;
}

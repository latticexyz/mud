import { Cursor, Query } from "@nomicfoundation/slang/cst";
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

export function findContractNodeSlang(root: Cursor, contractName: string): Cursor | undefined {
  for (const result of root.query([
    Query.create(`
      @contract [ContractDefinition
        name: ["${contractName}"]
      ]
    `),
  ])) {
    return result.captures.contract?.[0];
  }
}

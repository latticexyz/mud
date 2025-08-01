import { Cursor, Query } from "@nomicfoundation/slang/cst";

export function findContractOrInterfaceNode(root: Cursor, contractName: string): Cursor | undefined {
  for (const result of root.query([
    Query.create(`
      @contract [ContractDefinition
        name: ["${contractName}"]
      ]
    `),
    Query.create(`
      @contract [InterfaceDefinition
        name: ["${contractName}"]
      ]
    `),
  ])) {
    return result.captures.contract?.[0];
  }
}

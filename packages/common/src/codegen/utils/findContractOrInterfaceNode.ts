import { Cursor, Query } from "@nomicfoundation/slang/cst";

export function findContractOrInterfaceNode(root: Cursor, contractOrInterfaceName: string): Cursor | undefined {
  for (const result of root.query([
    Query.create(`
      [ContractDefinition
        name: ["${contractOrInterfaceName}"]
      ]
    `),
    Query.create(`
      [InterfaceDefinition
        name: ["${contractOrInterfaceName}"]
      ]
    `),
  ])) {
    return result.root;
  }
}

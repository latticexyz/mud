import { Cursor, Query } from "@nomicfoundation/slang/cst";

export interface SymbolImport {
  symbol: string;
  path: string;
}

/**
 * Get import for given symbol.
 *
 * To avoid circular dependencies of interfaces on their implementations,
 * symbols used for args/returns must always be imported from an auxiliary file.
 * To avoid parsing the entire project to build dependencies,
 * symbols must be imported with an explicit `import { symbol } from ...`
 */
export function findSymbolImport(root: Cursor, symbol: string): SymbolImport | undefined {
  for (const result of root.query([
    Query.create(`
      [ImportDeconstruction
        [_ item: [ImportDeconstructionSymbol
          @name [Identifier]
          alias: [_ @alias identifier: [Identifier]]?]
        ]
        path: [StringLiteral @path [_]]
      ]
    `),
  ])) {
    const symbolName = result.captures.name?.[0].node.unparse();
    const symbolAlias = result.captures.alias?.[0].node.unparse() ?? symbolName;
    // The path node includes the quotation marks, so we stripped them off.
    const path = result.captures.path?.[0].node.unparse().slice(1, -1);
    if (symbol === symbolAlias) {
      return {
        symbol: symbolName,
        path,
      };
    }
  }
}

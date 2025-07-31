import { Cursor, Query } from "@nomicfoundation/slang/cst";
import { visit } from "@solidity-parser/parser";
import type { SourceUnit } from "@solidity-parser/parser/dist/src/ast-types";

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
export function findSymbolImport(ast: SourceUnit, symbol: string): SymbolImport | undefined {
  let symbolImport: SymbolImport | undefined;

  visit(ast, {
    ImportDirective({ path, symbolAliases }) {
      if (symbolAliases) {
        for (const symbolAndAlias of symbolAliases) {
          // either check the alias, or the original symbol if there's no alias
          const symbolAlias = symbolAndAlias[1] ?? symbolAndAlias[0];
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

  return symbolImport;
}

export function findSymbolImportSlang(root: Cursor, symbol: string): SymbolImport | undefined {
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
    const path = result.captures.path?.[0].node.unparse().slice(1, -1);
    if (symbol === symbolAlias) {
      return {
        symbol: symbolName,
        path,
      };
    }
  }
}

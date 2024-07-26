import { renderImportPath, renderList, renderedSolidityHeader } from "@latticexyz/common/codegen";
import { TableOptions } from "./getTableOptions";
import path from "node:path/posix";

/**
 * Returns Solidity code for table index file that imports all codegen tables
 * @param options table definitions
 * @returns string of Solidity code
 */
export function renderTableIndex(codegenIndexPath: string, options: TableOptions[]) {
  return `
    ${renderedSolidityHeader}

    ${renderList(options, ({ outputPath, tableName, renderOptions: { structName } }) => {
      const imports = [tableName];
      if (structName) imports.push(structName);

      return `import { ${imports.join(", ")} } from "${renderImportPath("./" + path.relative(path.dirname(codegenIndexPath), outputPath))}";`;
    })}
  `;
}

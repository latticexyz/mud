import path from "node:path";
import { posixPath, renderList, renderedSolidityHeader } from "@latticexyz/common/codegen";
import { TableOptions } from "./tableOptions";

/**
 * Returns Solidity code for table index file that imports all codegen tables
 * @param options table definitions
 * @returns string of Solidity code
 */
export function renderTableIndex(options: TableOptions[], importPathPrefix: string) {
  return `
    ${renderedSolidityHeader}

    ${renderList(options, ({ outputPath, tableName, renderOptions: { structName } }) => {
      const imports = [tableName];
      if (structName) imports.push(structName);

      return `import { ${imports.join(", ")} } from "./${posixPath(path.join(importPathPrefix, outputPath))}";`;
    })}
  `;
}

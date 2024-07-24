import { posixPath, renderedSolidityHeader } from "@latticexyz/common/codegen";
import { TableOptions } from "./tableOptions";

/**
 * Returns Solidity code for table index file that imports all codegen tables
 * @param options table definitions
 * @returns string of Solidity code
 */
export function renderTableIndex(options: TableOptions[]) {
  return `
    ${renderedSolidityHeader}

    ${options
      .map(({ outputPath, tableName, renderOptions: { structName } }) => {
        const imports = [tableName, ...(structName ? [structName] : [])];
        return `import { ${imports.join(", ")} } from "./${posixPath(outputPath)}";`;
      })
      .join("\n")}
  `;
}

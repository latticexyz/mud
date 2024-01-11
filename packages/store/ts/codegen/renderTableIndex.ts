import { posixPath, renderList, renderedSolidityHeader } from "@latticexyz/common/codegen";
import { TableOptions } from "./tableOptions";

export function renderTableIndex(options: TableOptions[]) {
  return `
    ${renderedSolidityHeader}

    ${renderList(options, ({ outputPath, tableName, renderOptions: { structName, staticResourceData } }) => {
      const imports = [tableName];
      if (structName) imports.push(structName);
      if (staticResourceData) imports.push(staticResourceData.tableIdName);

      return `import { ${imports.join(", ")} } from "./${posixPath(outputPath)}";`;
    })}
  `;
}

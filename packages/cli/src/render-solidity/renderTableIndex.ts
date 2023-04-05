import { renderList, renderedSolidityHeader } from "./common.js";
import { TableOptions } from "./tableOptions.js";

export function renderTableIndex(options: TableOptions[]) {
  return `${renderedSolidityHeader}

${renderList(options, ({ outputPath, tableName, renderOptions: { structName } }) => {
  const structImport = structName ? `, ${structName}` : "";
  return `import { ${tableName}, ${tableName}TableId${structImport} } from "./${outputPath}";`;
})}
`;
}

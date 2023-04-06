import { renderList, renderedSolidityHeader } from "./common.js";
import { TableOptions } from "./tableOptions.js";

export function renderTableIndex(options: TableOptions[]) {
  return `${renderedSolidityHeader}

${renderList(options, ({ outputPath, tableName, renderOptions: { structName, staticResourceData } }) => {
  const imports = [tableName];
  if (structName) imports.push(structName);
  if (staticResourceData) imports.push(`${tableName}TableId`);

  return `import { ${imports.join(", ")} } from "./${outputPath}";`;
})}
`;
}

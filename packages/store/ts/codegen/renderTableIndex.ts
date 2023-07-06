import { posixPath, renderList, renderedSolidityHeader } from "@latticexyz/common/codegen";
import { TableOptions } from "./tableOptions";

export function renderTableIndex(options: TableOptions[]) {
  return `${renderedSolidityHeader}

${renderList(options, ({ outputPath, selectorName, renderOptions: { structName, staticResourceData } }) => {
  const imports = [selectorName];
  if (structName) imports.push(structName);
  if (staticResourceData) imports.push(`${selectorName}TableId`);

  return `import { ${imports.join(", ")} } from "./${posixPath(outputPath)}";`;
})}
`;
}

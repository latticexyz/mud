import { renderArguments, renderList, renderedSolidityHeader } from "./common.js";
import { RenderTypesOptions } from "./types.js";

export function renderTypes(options: RenderTypesOptions) {
  const { enums } = options;

  return `${renderedSolidityHeader}

${renderList(
  enums,
  ({ name, memberNames }) => `
  enum ${name} {
    ${renderArguments(memberNames)}
  }
`
)}

`;
}

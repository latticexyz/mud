import { renderArguments, renderList, renderedSolidityHeader, renderImports } from "./common.js";
import { RenderSystemInterfaceOptions } from "./types.js";

export function renderSystemInterface(options: RenderSystemInterfaceOptions) {
  const { imports, name, functionPrefix, functions } = options;

  return `${renderedSolidityHeader}

${renderImports(imports)}

interface ${name} {
  ${renderList(
    functions,
    ({ name, parameters, returnParameters }) => `
    function ${functionPrefix}${name}(${renderArguments(parameters)}) external ${renderReturnParameters(
      returnParameters
    )};
  `
  )}
}

`;
}

function renderReturnParameters(returnParameters: string[]) {
  if (returnParameters.length > 0) {
    return `returns (${renderArguments(returnParameters)})`;
  } else {
    return "";
  }
}

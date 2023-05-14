import { renderArguments, renderList, renderedSolidityHeader, renderImports } from "@latticexyz/common/codegen";
import { RenderSystemInterfaceOptions } from "./types";

export function renderSystemInterface(options: RenderSystemInterfaceOptions) {
  const { imports, name, functionPrefix, functions, errors } = options;

  return `${renderedSolidityHeader}

${renderImports(imports)}

interface ${name} {
  ${renderList(errors, ({ name, parameters }) => `error ${name}(${renderArguments(parameters)});`)}

  ${renderList(
    functions,
    ({ name, parameters, stateMutability, returnParameters }) => `
    function ${functionPrefix}${name}(
      ${renderArguments(parameters)}
    ) external ${stateMutability} ${renderReturnParameters(returnParameters)};
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

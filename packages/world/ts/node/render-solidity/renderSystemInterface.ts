import { renderArguments, renderList, renderedSolidityHeader, renderImports } from "@latticexyz/common/codegen";
import { RenderSystemInterfaceOptions } from "./types";

export function renderSystemInterface(options: RenderSystemInterfaceOptions) {
  const { imports, name, functionPrefix, functions, errors, events, structs, enums } = options;

  return `
    ${renderedSolidityHeader}

    ${renderImports(imports)}

    /**
     * @title ${name}
     * @dev This interface is automatically generated from the corresponding system contract. Do not edit manually.
     */
    interface ${name} {
      ${renderList(errors, ({ name, parameters }) => `error ${name}(${renderArguments(parameters)});`)}

      ${renderList(events, ({ name, parameters }) => `event ${name}(${renderArguments(parameters)});`)}

      ${renderList(structs, ({ name, members }) => `struct ${name} {${renderList(members, (member) => `${member};`)}}`)}

      ${renderList(enums, ({ name, members }) => `enum ${name} {${renderArguments(members)}}`)}

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

import { renderList, renderedSolidityHeader, renderImports } from "@latticexyz/common/codegen";
import { RenderSystemInterfaceOptions } from "./types";
import { renderArgumentParameters, renderReturnParameters } from "./utils";

export function renderSystemInterface(options: RenderSystemInterfaceOptions) {
  const { imports, name, functionPrefix, functions, errors } = options;

  return `
    ${renderedSolidityHeader}

    ${renderImports(imports)}

    /**
     * @title ${name} 
     * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
     * @dev This interface is automatically generated from the corresponding system contract. Do not edit manually.
     */
    interface ${name} {
      ${renderList(errors, ({ name, parameters }) => `error ${name}(${renderArgumentParameters(parameters)});`)}

      ${renderList(
        functions,
        ({ name, parameters, stateMutability, returnParameters }) => `
          function ${functionPrefix}${name}(
            ${renderArgumentParameters(parameters)}
          ) external ${stateMutability} ${renderReturnParameters(returnParameters)};
        `,
      )}
    }
  `;
}

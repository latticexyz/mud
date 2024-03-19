import {
  renderArguments,
  renderList,
  renderedSolidityHeader,
  renderImports,
  ParsedParameter,
} from "@latticexyz/common/codegen";
import { RenderSystemLibraryOptions } from "./types";
import { renderArgumentParameters, renderReturnParameters } from "./utils";

export function renderSystemLibrary(options: RenderSystemLibraryOptions) {
  const { worldImportPath, imports, systemName, interfaceName, libraryName, namespace, functions } = options;

  return `
    ${renderedSolidityHeader}

    import { IWorldKernel } from "${worldImportPath}IWorldKernel.sol";
    import { WorldContextConsumerLib } from "${worldImportPath}WorldContext.sol";
    import { ResourceId, WorldResourceIdLib } from "${worldImportPath}WorldResourceId.sol";
    import { RESOURCE_SYSTEM } from "${worldImportPath}worldResourceTypes.sol";

    ${renderImports(imports)}

    library Utils {
      bytes14 constant namespace = "${namespace}";
      bytes16 constant name = "${systemName}";

      function systemId(bytes14 _namespace) internal pure returns (ResourceId) {
        return WorldResourceIdLib.encode({ typeId: RESOURCE_SYSTEM, namespace: _namespace, name: name });
      }

      function systemId() internal pure returns (ResourceId) {
        return systemId(namespace);
      }
    }

    /**
     * @title ${libraryName} 
     * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
     * @dev This library is automatically generated from the corresponding system contract. Do not edit manually.
     */
    library ${libraryName} {
      ${renderList(
        functions,
        ({ name, parameters, returnParameters }) => `
          function ${name}(
            ${renderArgumentParameters(parameters)}
          ) internal ${renderReturnParameters(returnParameters)} {
            ${renderFunctionBody({ interfaceName, functionName: name, parameters, returnParameters })}
          }
        `,
      )}
    }
  `;
}

function renderFunctionBody({
  interfaceName,
  functionName,
  parameters,
  returnParameters,
}: {
  interfaceName: string;
  functionName: string;
  parameters: ParsedParameter[];
  returnParameters: ParsedParameter[];
}) {
  let result = `
    IWorldKernel(WorldContextConsumerLib._world()).call(Utils.systemId(),
      abi.encodeCall(${interfaceName}.${functionName}, (
        ${renderArguments(parameters.map(({ name }) => name))}
      ))
    )
  `;

  if (returnParameters.length > 0) {
    result = `return abi.decode(${result}, (
      ${renderArguments(returnParameters.map(({ typeName }) => typeName))}
    ))`;
  }

  return result + ";";
}

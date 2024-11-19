import {
  renderArguments,
  renderList,
  renderedSolidityHeader,
  renderImports,
  ContractInterfaceFunction,
} from "@latticexyz/common/codegen";
import { RenderSystemLibraryOptions } from "./types";

export function renderSystemLibrary(options: RenderSystemLibraryOptions) {
  const {
    imports: systemImports,
    libraryName,
    systemLabel,
    resourceId,
    functions,
    errors,
    worldImportPath,
    storeImportPath,
  } = options;

  // Add required imports, if they are already included they will get removed in renderImports
  const imports = [
    ...systemImports,
    {
      symbol: "revertWithBytes",
      path: `${worldImportPath}/revertWithBytes.sol`,
    },
    {
      symbol: "IWorldCall",
      path: `${worldImportPath}/IWorldKernel.sol`,
    },
    {
      symbol: "ResourceId",
      path: `${storeImportPath}/ResourceId.sol`,
    },
    {
      symbol: "StoreSwitch",
      path: `${storeImportPath}/StoreSwitch.sol`,
    },
  ];

  const camelCaseSystemLabel = systemLabel.charAt(0).toLowerCase() + systemLabel.slice(1);
  const userTypeName = `${systemLabel}Type`;

  return `
    ${renderedSolidityHeader}

    ${renderImports(imports)}

    type ${userTypeName} is bytes32;

    ${renderResourceIdBinding(userTypeName, camelCaseSystemLabel, resourceId)}

    /**
     * @title ${libraryName}
     * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
     * @dev This library is automatically generated from the corresponding system contract. Do not edit manually.
     */
    library ${libraryName} {
      struct CallFromWrapper {
        ${userTypeName} systemId;
        address from;
      }

      ${renderList(errors, ({ name, parameters }) => `error ${name}(${renderArguments(parameters)});`)}

      ${renderList(functions, (fn) => renderFunction(systemLabel, userTypeName, fn))}

      // TODO: rename to callFrom?
      function from(${userTypeName} systemId, address _from) internal pure returns (CallFromWrapper memory) {
        return CallFromWrapper({ systemId: systemId, from: _from });
      }

      function toResourceId(${userTypeName} systemId) internal pure returns (ResourceId) {
        return ResourceId.wrap(${userTypeName}.unwrap(systemId));
      }

      function fromResourceId(ResourceId resourceId) internal pure returns (${userTypeName}) {
        return ${userTypeName}.wrap(resourceId.unwrap());
      }

      function _world() private view returns (IWorldCall) {
        return IWorldCall(StoreSwitch.getStoreAddress());
      }
    }

    using ${libraryName} for ${userTypeName} global;
  `;
}

function renderResourceIdBinding(userTypeName: string, systemLabel: string, resourceId: string) {
  return `${userTypeName} constant ${systemLabel} = ${userTypeName}.wrap(${resourceId});`;
}

function renderFunction(systemLabel: string, userTypeName: string, fn: ContractInterfaceFunction) {
  const { name, parameters, stateMutability, returnParameters } = fn;

  const allParameters = [`${userTypeName} __systemId`, ...parameters];

  if (stateMutability === "") {
    return `
      function ${name}(
        ${renderArguments(allParameters)}
      ) internal ${renderReturnParameters(returnParameters)} {
        bytes memory systemCall = ${renderEncodeSystemCall(systemLabel, name, parameters)};
        bytes memory result = _world().call(__systemId.toResourceId(), systemCall);
        ${renderAbiDecode(returnParameters)}
      }
    `;
  } else {
    return `
      function ${name}(
        ${renderArguments(allParameters)}
      ) internal ${stateMutability} ${renderReturnParameters(returnParameters)} {
        bytes memory systemCall = ${renderEncodeSystemCall(systemLabel, name, parameters)};
        bytes memory worldCall = abi.encodeCall(IWorldCall.call, (__systemId.toResourceId(), systemCall));
        (bool success, bytes memory returnData) = address(_world()).staticcall(worldCall);
        if (!success) revertWithBytes(returnData);
        bytes memory result = abi.decode(returnData, (bytes));

        ${renderAbiDecode(returnParameters)}
      }
    `;
  }
}

function renderEncodeSystemCall(interfaceName: string, functionName: string, parameters: string[]) {
  return `abi.encodeCall(${interfaceName}.${functionName}, (${parameters.map((param) => param.split(" ").slice(-1)[0]).join(", ")}))`;
}

function renderAbiDecode(returnParameters: string[]) {
  if (returnParameters.length === 0) return "result;";
  return `return abi.decode(result, (${returnParameters.map((param) => param.split(" ")[0]).join(", ")}));`;
}

function renderReturnParameters(returnParameters: string[]) {
  if (returnParameters.length > 0) {
    return `returns (${renderArguments(returnParameters)})`;
  } else {
    return "";
  }
}

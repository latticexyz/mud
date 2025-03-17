import {
  renderArguments,
  renderList,
  renderedSolidityHeader,
  renderImports,
  ContractInterfaceFunction,
} from "@latticexyz/common/codegen";
import { RenderSystemLibraryOptions } from "./types";
import { ContractInterfaceError } from "@latticexyz/common/codegen";

export function renderSystemLibrary(options: RenderSystemLibraryOptions) {
  const {
    imports: systemImports,
    libraryName,
    systemLabel,
    systemName,
    namespace,
    resourceId,
    functions: functionsInput,
    errors: systemErrors,
    worldImportPath,
    storeImportPath,
  } = options;

  // Remove `payable` from stateMutability for library functions
  const functions = functionsInput.map((func) => ({
    ...func,
    stateMutability: func.stateMutability.replace("payable", ""),
  }));

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
      symbol: "SystemCall",
      path: `${worldImportPath}/SystemCall.sol`,
    },
    {
      symbol: "WorldContextConsumerLib",
      path: `${worldImportPath}/WorldContext.sol`,
    },
    {
      symbol: "Systems",
      path: `${worldImportPath}/codegen/tables/Systems.sol`,
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

  const callingFromRootSystemErrorName = `${libraryName}_CallingFromRootSystem`;
  const errors = [{ name: callingFromRootSystemErrorName, parameters: [] }, ...systemErrors];

  const camelCaseSystemLabel = systemLabel.charAt(0).toLowerCase() + systemLabel.slice(1);
  const userTypeName = `${systemLabel}Type`;

  return `
    ${renderedSolidityHeader}

    ${renderImports(imports)}

    type ${userTypeName} is bytes32;

    // equivalent to WorldResourceIdLib.encode({ typeId: RESOURCE_SYSTEM, namespace: "${namespace}", name: "${systemName}" }))
    ${userTypeName} constant ${camelCaseSystemLabel} = ${userTypeName}.wrap(${resourceId});

    struct CallWrapper {
      ResourceId systemId;
      address from;
    }

    struct RootCallWrapper {
      ResourceId systemId;
      address from;
    }

    /**
     * @title ${libraryName}
     * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
     * @dev This library is automatically generated from the corresponding system contract. Do not edit manually.
     */
    library ${libraryName} {
      ${renderErrors(errors)}

      ${renderList(functions, (contractFunction) => renderUserTypeFunction(contractFunction, userTypeName))}

      ${renderList(functions, (contractFunction) => renderCallWrapperFunction(contractFunction, callingFromRootSystemErrorName))}

      ${renderList(functions, (contractFunction) => renderRootCallWrapperFunction(contractFunction, namespace))}

      function callFrom(${userTypeName} self, address from) internal pure returns (CallWrapper memory) {
        return CallWrapper(self.toResourceId(), from);
      }

      function callAsRoot(${userTypeName} self) internal view returns (RootCallWrapper memory) {
        return RootCallWrapper(self.toResourceId(), WorldContextConsumerLib._msgSender());
      }

      function callAsRootFrom(${userTypeName} self, address from) internal pure returns (RootCallWrapper memory) {
        return RootCallWrapper(self.toResourceId(), from);
      }

      function toResourceId(${userTypeName} self) internal pure returns (ResourceId) {
        return ResourceId.wrap(${userTypeName}.unwrap(self));
      }

      function fromResourceId(ResourceId resourceId) internal pure returns (${userTypeName}) {
        return ${userTypeName}.wrap(resourceId.unwrap());
      }

      function getAddress(${userTypeName} self) internal view returns(address) {
        return Systems.getSystem(self.toResourceId());
      }

      function _world() private view returns (IWorldCall) {
        return IWorldCall(StoreSwitch.getStoreAddress());
      }
    }

    ${
      functions.length > 0
        ? `/**
         * System Function Interfaces
         *
         * We generate an interface for each system function, which is then used for encoding system calls.
         * This is necessary to handle function overloading correctly (which abi.encodeCall cannot).
         *
         * Each interface is uniquely named based on the function name and parameters to prevent collisions.
         */`
        : ""
    }
    ${renderList(functions, (contractFunction) => renderFunctionInterface(contractFunction))}


    using ${libraryName} for ${userTypeName} global;
    using ${libraryName} for CallWrapper global;
    using ${libraryName} for RootCallWrapper global;
  `;
}

function renderErrors(errors: ContractInterfaceError[]) {
  return renderList(errors, ({ name, parameters }) => `  error ${name}(${renderArguments(parameters)});`);
}

function renderUserTypeFunction(contractFunction: ContractInterfaceFunction, userTypeName: string) {
  const { name, parameters, stateMutability, returnParameters } = contractFunction;

  const args = [`${userTypeName} self`, ...parameters].map((arg) => arg.replace(/ calldata /, " memory "));

  const functionSignature = `
    function ${name}(
      ${renderArguments(args)}
    ) internal
      ${stateMutability === "pure" ? "view" : stateMutability}
      ${renderReturnParameters(returnParameters)}
  `;

  const callWrapperArguments = parameters.map((param) => param.split(" ").slice(-1)[0]).join(", ");

  return `
    ${functionSignature} {
      return CallWrapper(self.toResourceId(), address(0)).${name}(${callWrapperArguments});
    }
  `;
}

function renderCallWrapperFunction(
  contractFunction: ContractInterfaceFunction,
  callingFromRootSystemErrorName: string,
) {
  const { name, parameters, stateMutability, returnParameters } = contractFunction;

  const args = [`CallWrapper memory self`, ...parameters].map((arg) => arg.replace(/ calldata /, " memory "));

  const functionSignature = `
    function ${name}(
      ${renderArguments(args)}
    ) internal
      ${stateMutability === "pure" ? "view" : stateMutability}
      ${renderReturnParameters(returnParameters)}
  `;

  const rootSystemCheck = `
    // if the contract calling this function is a root system, it should use \`callAsRoot\`
    if (address(_world()) == address(this)) revert ${callingFromRootSystemErrorName}();
  `;

  const encodedSystemCall = renderEncodeSystemCall(contractFunction);

  if (stateMutability === "") {
    return `
      ${functionSignature} {
        ${rootSystemCheck}
        bytes memory systemCall = ${encodedSystemCall};
        ${renderAbiDecode(
          "self.from == address(0) ? _world().call(self.systemId, systemCall) : _world().callFrom(self.from, self.systemId, systemCall)",
          returnParameters,
        )}
      }
    `;
  } else {
    return `
      ${functionSignature} {
        ${rootSystemCheck}
        bytes memory systemCall = ${encodedSystemCall};
        bytes memory worldCall = self.from == address(0)
          ? abi.encodeCall(IWorldCall.call, (self.systemId, systemCall))
          : abi.encodeCall(IWorldCall.callFrom, (self.from, self.systemId, systemCall));
        (bool success, bytes memory returnData) = address(_world()).staticcall(worldCall);
        if (!success) revertWithBytes(returnData);
        ${renderAbiDecode("abi.decode(returnData, (bytes))", returnParameters)}
      }
    `;
  }
}

function renderRootCallWrapperFunction(contractFunction: ContractInterfaceFunction, namespace: string) {
  const { name, parameters, stateMutability, returnParameters } = contractFunction;

  // Staticcalls are not supported between root systems yet, due to the additional
  // complexity of checking that we are in a staticall context at runtime
  if (namespace === "" && stateMutability != "") {
    return "";
  }

  const args = ["RootCallWrapper memory self", ...parameters].map((arg) => arg.replace(/ calldata /, " memory "));

  const functionSignature = `
    function ${name}(
      ${renderArguments(args)}
    ) internal
      ${stateMutability === "pure" ? "view" : stateMutability}
      ${renderReturnParameters(returnParameters)}
  `;

  const encodedSystemCall = renderEncodeSystemCall(contractFunction);

  if (stateMutability === "") {
    return `
      ${functionSignature} {
        bytes memory systemCall = ${encodedSystemCall};
        ${renderAbiDecode(
          "SystemCall.callWithHooksOrRevert(self.from, self.systemId, systemCall, msg.value)",
          returnParameters,
        )}
      }
    `;
  } else {
    return `
      ${functionSignature} {
        bytes memory systemCall = ${encodedSystemCall};
        ${renderAbiDecode("SystemCall.staticcallOrRevert(self.from, self.systemId, systemCall)", returnParameters)}
      }
    `;
  }
}

function renderFunctionInterface(contractFunction: ContractInterfaceFunction) {
  const { name, parameters } = contractFunction;

  const args = parameters.map((arg) => arg.replace(/ calldata /, " memory "));

  return `
    interface ${functionInterfaceName(contractFunction)} {
      function ${name}(
        ${renderArguments(args)}
      ) external;
    }
  `;
}

function functionInterfaceName(contractFunction: ContractInterfaceFunction) {
  const { name, parameters } = contractFunction;
  const paramTypes = parameters
    .map((param) => param.split(" ")[0])
    .map((type) => type.replace("[]", "Array"))
    .join("_");
  return `_${name}${paramTypes.length === 0 ? "" : `_${paramTypes}`}`;
}

function renderEncodeSystemCall(contractFunction: ContractInterfaceFunction) {
  const { name, parameters } = contractFunction;
  const paramNames = parameters.map((param) => param.split(" ").slice(-1)[0]).join(", ");
  return `abi.encodeCall(${functionInterfaceName(contractFunction)}.${name}, (${paramNames}))`;
}

function renderAbiDecode(expression: string, returnParameters: string[]) {
  if (returnParameters.length === 0) return `${expression};`;

  const returnTypes = returnParameters.map((param) => param.split(" ")[0]).join(", ");
  return `
    bytes memory result = ${expression};
    return abi.decode(result, (${returnTypes}));
  `;
}

function renderReturnParameters(returnParameters: string[]) {
  if (returnParameters.length == 0) return "";

  return `returns (${renderArguments(returnParameters)})`;
}

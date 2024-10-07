import { AbiParameter, Hex } from "viem";
import { Abi, AbiError, AbiFunction, formatAbiItem, formatAbiParameter } from "abitype";
import { renderedSolidityHeader } from "./common";
import { hexToResource } from "../../hexToResource";

function formatParam(param: AbiParameter): string {
  // return param.type === "string" || param.type === "bytes" || param.type === "tuple" || param.type.endsWith("]")
  //   ? `${formatAbiParameter(param)} memory`
  //   : formatAbiParameter(param);
  return formatAbiParameter(param);
}

function formatFunction(item: AbiFunction): string {
  const params = item.inputs.map(formatParam).join(", ");
  const returns = item.outputs.map(formatParam).join(", ");
  return `function ${item.name}(${params}) external${returns.length ? ` returns (${returns})` : ""}`;
}

function formatSystemId(systemId: Hex): string {
  const resource = hexToResource(systemId);
  return `
    // equivalent to \`WorldResourceIdLib.encode({ namespace: ${JSON.stringify(
      resource.namespace,
    )}, name: ${JSON.stringify(resource.name)}, typeId: RESOURCE_SYSTEM });\`
    ResourceId constant systemId = ResourceId.wrap(${systemId});
  `;
}

export type AbiToInterfaceOptions = {
  name: string;
  systemId?: Hex;
  abi: Abi;
};

export function abiToInterface({ name, systemId, abi }: AbiToInterfaceOptions): string {
  const imports = systemId ? [`{ ResourceId } from "@latticexyz/store/src/ResourceId.sol"`] : [];
  const errors = abi.filter((item): item is AbiError => item.type === "error");
  const functions = abi.filter((item): item is AbiFunction => item.type === "function");

  return `
    ${renderedSolidityHeader}

    ${imports.map((item) => `import ${item};`).join("\n")}

    ${systemId ? formatSystemId(systemId) : ""}

    interface ${name} {
      ${errors.map((item) => `${formatAbiItem(item)};`).join("\n")}

      ${functions
        .map((item) => {
          if ([...item.inputs, ...item.outputs].some((param) => param.type.startsWith("tuple"))) {
            return `// TODO: replace tuple with struct\n// ${formatFunction(item)};`;
          }
          return `${formatFunction(item)};`;
        })
        .join("\n")}
    }
  `;
}

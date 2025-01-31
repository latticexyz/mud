import { hexToResource, resourceToLabel } from "@latticexyz/common";
import { Hex } from "viem";

/** @internal */
export function internal_normalizeSystemFunctionName(systemId: Hex, functionName: string) {
  const resource = hexToResource(systemId);
  const worldFunctionPrefix = resource.namespace !== "" ? `${resource.namespace}__` : null;
  if (worldFunctionPrefix != null && functionName.startsWith(worldFunctionPrefix)) {
    console.warn(
      // eslint-disable-next-line max-len
      `Detected world function name "${functionName}" used in call to system "${resourceToLabel(resource)}".\n\nIt's recommended to use a system ABI and system function name with these methods instead.`,
    );
    return functionName.slice(worldFunctionPrefix.length);
  }
  return functionName;
}

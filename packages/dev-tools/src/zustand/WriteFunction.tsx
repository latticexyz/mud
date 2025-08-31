import { useEffect, useState } from "react";
import { slice, parseAbiItem, decodeAbiParameters, type Hex } from "viem";
import { worldTables } from "@latticexyz/store-sync";
import { useDevToolsContext } from "../DevToolsContext";
import { WriteFunctionNameAndArgs } from "../actions/WriteFunctionNameAndArgs";

type Props = {
  worldFunctionName: string;
  systemFunctionCalldata: Hex;
};

export function WriteFunction({ worldFunctionName, systemFunctionCalldata }: Props) {
  const { useStore } = useDevToolsContext();
  if (!useStore) throw new Error("Missing useStore");

  // The first 4 bytes of calldata represent the function selector.
  const systemFunctionSelector = slice(systemFunctionCalldata, 0, 4);

  const getSystemFunctionSignature = (state: ReturnType<(typeof useStore)["getState"]>) =>
    state.getValue(worldTables.FunctionSignatures, { functionSelector: systemFunctionSelector })?.functionSignature;

  // React doesn't like using hooks from another copy of React libs, so we have to use the non-React API to get data out of Zustand
  const [systemFunctionSignature, setSystemFunctionSignature] = useState(
    getSystemFunctionSignature(useStore.getState()),
  );

  useEffect(() => {
    return useStore.subscribe((state) => {
      if (systemFunctionSignature) return;

      const signature = getSystemFunctionSignature(state);
      if (signature) {
        setSystemFunctionSignature(signature);
      }
    });
  }, [useStore, systemFunctionSignature]);

  // Not synced yet
  if (!systemFunctionSignature) return null;

  const systemFunctionAbiItem = parseAbiItem(`function ${systemFunctionSignature}`);
  if (systemFunctionAbiItem.type !== "function") throw new Error("Unreachable");

  const systemFunctionArgs = systemFunctionAbiItem.inputs.length
    ? decodeAbiParameters(systemFunctionAbiItem.inputs, slice(systemFunctionCalldata, 4))
    : undefined;

  return (
    <WriteFunctionNameAndArgs name={systemFunctionAbiItem.name} args={systemFunctionArgs} viaName={worldFunctionName} />
  );
}

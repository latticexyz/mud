import { useConfig } from "../../AccountKitConfigProvider";

export function useGasPerAction(): bigint {
  const { gasPerAction } = useConfig();
  // TODO: compute this from world tx history if not set
  return gasPerAction ?? 500_000n;
}

import { Paymaster, PaymasterType } from "./config";
import { useErc4337Config } from "./useErc4337Config";

export function usePaymaster(type: PaymasterType): Paymaster | undefined {
  const config = useErc4337Config();
  return config?.paymasters.find((paymaster) => paymaster.type === type);
}

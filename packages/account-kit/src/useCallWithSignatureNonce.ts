import { useWalletClient } from "wagmi";
import { useConfig } from "./MUDAccountKitProvider";
import { useRecord } from "./useRecord";
import modulesConfig from "@latticexyz/world-modules/internal/mud.config";

export function useCallWithSignatureNonce() {
  const { chain, worldAddress } = useConfig();
  const { data: userAccountClient } = useWalletClient({ chainId: chain.id });

  return useRecord(
    {
      storeAddress: worldAddress,
      table: modulesConfig.tables.CallWithSignatureNonces,
      key: { signer: userAccountClient?.account.address ?? "0x" },
      blockTag: "pending",
    },
    {
      enabled: !!userAccountClient,
    },
  );
}

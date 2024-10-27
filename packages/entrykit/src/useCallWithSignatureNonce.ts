import { useWalletClient } from "wagmi";
import { useEntryKitConfig } from "./EntryKitConfigProvider";
import { useRecord } from "./useRecord";
import modulesConfig from "@latticexyz/world-modules/internal/mud.config";

export function useCallWithSignatureNonce() {
  const { chainId, worldAddress } = useEntryKitConfig();
  const { data: userClient } = useWalletClient({ chainId });
  const userAddress = userClient?.account.address;

  const result = useRecord(
    userAddress
      ? {
          chainId,
          address: worldAddress,
          table: modulesConfig.tables.CallWithSignatureNonces,
          key: { signer: userAddress },
          blockTag: "pending",
        }
      : {},
  );

  return {
    ...result,
    nonce: result.data?.nonce,
  };
}

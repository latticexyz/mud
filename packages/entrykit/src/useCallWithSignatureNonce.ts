import { useWalletClient } from "wagmi";
import { useEntryKitConfig } from "./EntryKitConfigProvider";
import { useRecord } from "./useRecord";
import modulesConfig from "@latticexyz/world-modules/internal/mud.config";

export function useCallWithSignatureNonce() {
  const { chainId, worldAddress } = useEntryKitConfig();
  const { data: userAccountClient } = useWalletClient({ chainId });
  const userAccountAddress = userAccountClient?.account.address;

  const result = useRecord(
    userAccountAddress
      ? {
          chainId,
          address: worldAddress,
          table: modulesConfig.tables.CallWithSignatureNonces,
          key: { signer: userAccountAddress },
          blockTag: "pending",
        }
      : {},
  );

  return {
    ...result,
    nonce: result.data?.nonce,
  };
}

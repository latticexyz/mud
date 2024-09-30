import { useWalletClient } from "wagmi";
import { useConfig } from "./EntryKitConfigProvider";
import { useRecord } from "./useRecord";
import modulesConfig from "@latticexyz/world-modules/internal/mud.config";

export function useCallWithSignatureNonce() {
  const { chainId, worldAddress } = useConfig();
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
    nonce: result.record?.nonce,
  };
}

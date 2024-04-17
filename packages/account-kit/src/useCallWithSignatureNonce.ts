import { useWalletClient } from "wagmi";
import { useConfig } from "./AccountKitProvider";
import { useRecord } from "./useRecord";
import modulesConfig from "@latticexyz/world-modules/internal/mud.config";

export function useCallWithSignatureNonce() {
  const { chain, worldAddress } = useConfig();
  const { data: userAccountClient } = useWalletClient({ chainId: chain.id });
  const userAccountAddress = userAccountClient?.account.address;

  const result = useRecord(
    userAccountAddress
      ? {
          chainId: chain.id,
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

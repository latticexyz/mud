import { resourceToHex } from "@latticexyz/common";
import IBaseWorldAbi from "@latticexyz/world/out/IBaseWorld.sol/IBaseWorld.abi.json";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Hex, encodeFunctionData } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";
import { unlimitedDelegationControlId } from "../../common";
import { useAppAccountClient } from "../../useAppAccountClient";
import { signCall } from "../../utils/signCall";
import { useConfig } from "../../AccountKitConfigProvider";
import { useCallWithSignatureNonce } from "../../useCallWithSignatureNonce";
import { createStore } from "zustand/vanilla";
import { useMemo } from "react";
import { useStore } from "zustand";

const store = createStore(() => ({ signature: undefined as Hex | undefined }));

export function useSignRegisterDelegation() {
  const queryClient = useQueryClient();
  const { chainId, worldAddress } = useConfig();
  const publicClient = usePublicClient({ chainId });
  const { data: userAccountClient } = useWalletClient({ chainId });
  const { data: appAccountClient } = useAppAccountClient();
  const { nonce } = useCallWithSignatureNonce();
  const registerDelegationSignature = useStore(store, (state) => state.signature);

  const result = useMutation({
    mutationFn: async () => {
      if (!publicClient) throw new Error("Public client not ready. Not connected?");
      if (!userAccountClient) throw new Error("Wallet client not ready. Not connected?");
      if (!appAccountClient) throw new Error("App account client not ready.");
      if (nonce == null) throw new Error("Nonce not ready.");

      const signature = await signCall({
        userAccountClient,
        chainId,
        worldAddress,
        systemId: resourceToHex({ type: "system", namespace: "", name: "Registration" }),
        callData: encodeFunctionData({
          abi: IBaseWorldAbi,
          functionName: "registerDelegation",
          args: [appAccountClient.account.address, unlimitedDelegationControlId, "0x"],
        }),
        nonce,
      });

      await queryClient.invalidateQueries();
      store.setState({ signature });
      // TODO: reset step?

      return signature;
    },
  });

  return useMemo(
    () => ({
      ...result,
      signRegisterDelegation: result.mutate,
      signRegisterDelegationAsync: result.mutateAsync,
      registerDelegationSignature,
    }),
    [registerDelegationSignature, result],
  );
}

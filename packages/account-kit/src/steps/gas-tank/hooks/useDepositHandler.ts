import { useCallback, useMemo, useReducer } from "react";
import { Hex } from "viem";
import { useAccount, useConfig as useWagmiConfig, useWalletClient } from "wagmi";
import { WaitForTransactionReceiptReturnType, waitForTransactionReceipt } from "wagmi/actions";
import { DepositMethod } from "../DepositContent";
import { useConfig } from "../../../AccountKitProvider";
import { directDeposit } from "./directDeposit";
import { standardBridgeDeposit } from "./standardBridgeDeposit";
import { relayLinkDeposit } from "./relayLinkDeposit";

export type StatusType = "pending" | "loading" | "success" | "error" | "idle";

export type UseDepositHandlerReturnType = {
  receipt: WaitForTransactionReceiptReturnType | undefined;
  error: Error | undefined;
  txHash: Hex | undefined;
  deposit: () => void;
  isPending: boolean;
  isLoading: boolean;
  isSuccess: boolean;
};

const initialState = {
  receipt: undefined,
  txHash: undefined,
  status: "idle",
  error: undefined,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_STATUS":
      if (action.payload === "pending") {
        return { ...initialState, status: action.payload };
      }
      return { ...state, status: action.payload };
    case "SET_TX_HASH":
      return { ...state, status: "loading", txHash: action.payload };
    case "SET_RECEIPT":
      return { ...state, status: "success", receipt: action.payload };
    case "SET_ERROR":
      return { ...state, status: "error", error: action.payload };
    default:
      throw new Error("Unhandled action type");
  }
}

export const useDepositHandler = (depositMethod: DepositMethod) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { chain, gasTankAddress } = useConfig();
  const wagmiConfig = useWagmiConfig();
  const wallet = useWalletClient();
  const userAccount = useAccount();
  const userAccountAddress = userAccount.address;
  const userAccountChainId = userAccount?.chain?.id;

  const deposit = useCallback(
    async (amount: string) => {
      if (!wallet.data || !userAccountAddress || !userAccountChainId || !gasTankAddress || !amount) return;

      try {
        dispatch({ type: "SET_STATUS", payload: "pending" });

        let txHash;
        if (depositMethod === "direct") {
          txHash = await directDeposit({
            config: wagmiConfig,
            chainId: chain.id,
            gasTankAddress,
            userAccountAddress,
            amount,
          });

          dispatch({ type: "SET_TX_HASH", payload: txHash });

          const receipt = await waitForTransactionReceipt(wagmiConfig, {
            hash: txHash,
          });

          dispatch({ type: "SET_RECEIPT", payload: receipt });
        } else if (depositMethod === "bridge") {
          txHash = await standardBridgeDeposit({
            config: wagmiConfig,
            wallet,
            chainId: userAccountChainId,
            gasTankAddress,
            userAccountAddress,
            amount,
          });

          dispatch({ type: "SET_TX_HASH", payload: txHash });

          const receipt = await waitForTransactionReceipt(wagmiConfig, {
            hash: txHash,
          });

          dispatch({ type: "SET_RECEIPT", payload: receipt });
        } else if (depositMethod === "relay") {
          relayLinkDeposit({
            config: wagmiConfig,
            chainId: userAccountChainId,
            toChainId: chain.id,
            gasTankAddress,
            wallet,
            amount,
            onProgress: (data1, data2, data3, data4, data5) => {
              if (data5?.txHashes?.[0]) {
                const tx = data5.txHashes[0];
                dispatch({ type: "SET_TX_HASH", payload: tx.txHash });
              }
            },
          });
        }
      } catch (error) {
        console.error("Error depositing to gas tank", error);
        dispatch({ type: "SET_ERROR", payload: error });
      }
    },
    [userAccountAddress, depositMethod, wagmiConfig, chain.id, gasTankAddress, wallet, userAccountChainId],
  );

  return useMemo(() => {
    return {
      receipt: state.receipt,
      error: state.error,
      txHash: state.txHash,
      deposit,
      isPending: state.status === "pending",
      isLoading: state.status === "loading",
      isSuccess: state.status === "success",
    };
  }, [deposit, state.error, state.receipt, state.status, state.txHash]);
};

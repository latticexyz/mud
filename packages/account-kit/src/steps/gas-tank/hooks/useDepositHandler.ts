import { useCallback, useEffect, useMemo, useReducer } from "react";
import { Hex } from "viem";
import { useAccount, useConfig as useWagmiConfig, useWalletClient } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { DepositMethod } from "../DepositContent";
import { useConfig } from "../../../AccountKitProvider";
import { directDeposit } from "./directDeposit";
import { nativeDeposit } from "./nativeDeposit";
import { relayLinkDeposit } from "./relayLinkDeposit";
import { useGasTankBalance } from "../../../useGasTankBalance";
import { usePrevious } from "../../../utils/usePrevious";
import { usePaymaster } from "../../../usePaymaster";

export type StatusType = "pending" | "loading" | "loadingL2" | "success" | "error" | "idle";

type StateType = {
  txHash: Hex | undefined;
  status: StatusType;
  error: unknown;
};

type StatusActionType = {
  type: "SET_STATUS";
  payload: StatusType;
};

type TxHashActionType = {
  type: "SET_TX_HASH";
  payload: Hex;
};

type ErrorActionType = {
  type: "SET_ERROR";
  payload: unknown;
};

type ActionType = StatusActionType | TxHashActionType | ErrorActionType;

export type UseDepositHandlerReturnType = {
  error: Error | undefined;
  txHash: Hex | undefined;
  deposit: () => void;
  status: StatusType;
  isPending: boolean;
  isLoading: boolean;
  isSuccess: boolean;
};

const initialState: StateType = {
  txHash: undefined,
  status: "idle",
  error: undefined,
};

function reducer(state: StateType, action: ActionType): StateType {
  switch (action.type) {
    case "SET_STATUS":
      if (action.payload === "pending") {
        return { ...initialState, status: action.payload };
      }
      return { ...state, status: action.payload };
    case "SET_TX_HASH":
      return { ...state, status: "loading", txHash: action.payload };
    case "SET_ERROR":
      return { ...state, status: "error", error: action.payload };
    default:
      return state;
  }
}

export const useDepositHandler = (depositMethod: DepositMethod) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { chain } = useConfig();
  const gasTank = usePaymaster("gasTank");
  const wagmiConfig = useWagmiConfig();
  const wallet = useWalletClient();
  const userAccount = useAccount();
  const userAccountAddress = userAccount.address;
  const userAccountChainId = userAccount?.chain?.id;
  const { gasTankBalance } = useGasTankBalance();
  const prevGasTankBalance = usePrevious(gasTankBalance);

  useEffect(() => {
    if (prevGasTankBalance && state.status === "loadingL2" && prevGasTankBalance !== gasTankBalance) {
      dispatch({ type: "SET_STATUS", payload: "success" });
    }
  }, [gasTankBalance, prevGasTankBalance, state.status]);

  const deposit = useCallback(
    async (amount: number | undefined) => {
      if (!amount || !wallet.data || !userAccountAddress || !userAccountChainId || !amount || !gasTank) return;

      try {
        dispatch({ type: "SET_STATUS", payload: "pending" });

        if (depositMethod === "direct") {
          const txHash = await directDeposit({
            config: wagmiConfig,
            chainId: chain.id,
            gasTankAddress: gasTank.address,
            userAccountAddress,
            amount,
          });
          dispatch({ type: "SET_TX_HASH", payload: txHash });

          await waitForTransactionReceipt(wagmiConfig, { hash: txHash });
          dispatch({ type: "SET_STATUS", payload: "success" });
        } else if (depositMethod === "native") {
          const txHash = await nativeDeposit({
            config: wagmiConfig,
            wallet,
            chainId: userAccountChainId,
            gasTankAddress: gasTank.address,
            userAccountAddress,
            amount,
          });
          dispatch({ type: "SET_TX_HASH", payload: txHash });

          await waitForTransactionReceipt(wagmiConfig, {
            hash: txHash,
          });
          dispatch({ type: "SET_STATUS", payload: "loadingL2" });
        } else if (depositMethod === "relay") {
          relayLinkDeposit({
            config: wagmiConfig,
            chainId: userAccountChainId,
            toChainId: chain.id,
            gasTankAddress: gasTank.address,
            wallet,
            amount,
            onProgress: (data1, data2, data3, data4, data5) => {
              if (data5?.txHashes?.[0]) {
                const tx = data5.txHashes[0];
                dispatch({ type: "SET_TX_HASH", payload: tx.txHash });

                // TODO: wait for L2 tx
              }
            },
          });
        }
      } catch (error) {
        console.error("Error depositing to gas tank", error);
        dispatch({ type: "SET_ERROR", payload: error });
      }
    },
    [userAccountAddress, depositMethod, wagmiConfig, chain.id, gasTank, wallet, userAccountChainId],
  );

  return useMemo(() => {
    return {
      error: state.error,
      txHash: state.txHash,
      deposit,
      status: state.status,
      isPending: state.status === "pending",
      isLoading: state.status === "loading" || state.status === "loadingL2",
      isSuccess: state.status === "success",
    };
  }, [deposit, state.error, state.status, state.txHash]);
};

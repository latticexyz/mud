import { DepositMethod } from "../DepositContent";

export const useTransactionFees = (depositMethod: DepositMethod) => {
  // const [state, dispatch] = useReducer(reducer, initialState);
  // const { chain, gasTankAddress } = useConfig();
  // const wagmiConfig = useWagmiConfig();
  // const wallet = useWalletClient();
  // const userAccount = useAccount();
  // const userAccountAddress = userAccount.address;
  // const userAccountChainId = userAccount?.chain?.id;

  return {
    fees: depositMethod === "direct" ? "0.0001" : "0.0002",
    transferTime: depositMethod === "direct" ? 5 : 60,
  };
};

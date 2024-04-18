import { useState } from "react";
import { useAccount } from "wagmi";
import { useConfig } from "../../AccountKitProvider";
import { AccountModalTitle } from "../../AccoutModalTitle";
import { AccountModalSection } from "../../AccountModalSection";
import { GasTankStateContent } from "./GasTankStateContent";
import { ChainSelect } from "./components/ChainSelect";
import { AmountInput } from "./components/AmountInput";
import { BalancesFees } from "./components/BalancesFees";
import { ViewTransaction } from "./ViewTransaction";
import { Button } from "../../ui/Button";
import { useDepositHandler } from "./hooks/useDepositHandler";

export type DepositMethod = "direct" | "bridge" | "relay";

export function DepositContent() {
  const { chain } = useConfig();
  const userAccount = useAccount();
  const userAccountAddress = userAccount.address;
  const userAccountChainId = userAccount?.chain?.id;
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [depositMethod] = useState<DepositMethod>(() => {
    if (chain.id === userAccountChainId) return "direct";
    else if (chain.sourceId === userAccountChainId) return "bridge";
    else return "relay";
  });
  const { txHash, error, deposit, isPending, isLoading, isSuccess } = useDepositHandler(depositMethod);

  // TODO: move to useDepositHandler
  // const { gasTankBalance } = useGasTankBalance();
  // const prevGasTankBalance = usePrevious(gasTankBalance);
  // const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
  //   hash: txHash,
  // });
  // useEffect(() => {
  //   if (prevGasTankBalance && prevGasTankBalance !== gasTankBalance) {
  //     setSuccess(true);
  //   }
  // }, [gasTankBalance, prevGasTankBalance]);

  // TODO: add back
  // const queryClient = useQueryClient();
  // const { resetStep } = useOnboardingSteps();
  // useEffect(() => {
  //   if (isConfirmed) {
  //     queryClient.invalidateQueries();
  //     resetStep();
  //   }
  // }, [isConfirmed, queryClient, resetStep]);

  const handleSubmit = async () => {
    // TODO: rename to onDeposit?
    await deposit(depositAmount);
  };

  return (
    <>
      <AccountModalTitle title="Gas tank" />

      <AccountModalSection>
        <GasTankStateContent amount={depositAmount} isSuccess={isSuccess} />
      </AccountModalSection>

      <AccountModalSection>
        <div className="flex flex-col gap-2 p-5">
          {!isSuccess && (
            <>
              <p className="pb-2">
                Add funds from your wallet to your tank to fund transactions for any MUD apps on Chain Name.
              </p>

              <div className="flex gap-[12px]">
                <ChainSelect />
                <AmountInput amount={depositAmount} setAmount={setDepositAmount} />
              </div>

              <BalancesFees />

              {error ? <div>{String(error)}</div> : null}

              <Button className="w-full" pending={!userAccountAddress || isPending || isLoading} onClick={handleSubmit}>
                {isPending && "Confirm in wallet"}
                {isLoading && "Awaiting network"}
                {!isPending && !isLoading && "Deposit"}
              </Button>

              {txHash && <ViewTransaction hash={txHash} />}
            </>
          )}

          {isSuccess && (
            <>
              <h3>You’re good to go!</h3>
              <p>
                You can now use this to fund any of your transactions on MUD apps deployed to Chain Name. We have
                estimated of the number of transactions you can take above.
              </p>

              <div className="flex justify-between gap-[10px]">
                <Button className="w-full">Deposit more</Button>
                <Button className="w-full">Continue</Button>
              </div>
            </>
          )}
        </div>
      </AccountModalSection>
    </>
  );
}

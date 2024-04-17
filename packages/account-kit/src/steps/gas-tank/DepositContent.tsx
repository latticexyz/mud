import { useState, useEffect } from "react";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { useConfig } from "../../AccountKitProvider";
import { AccountModalTitle } from "../../AccoutModalTitle";
import { AccountModalSection } from "../../AccountModalSection";
import { GasTankStateContent } from "./GasTankStateContent";
import { ChainSelect } from "./components/ChainSelect";
import { AmountInput } from "./components/AmountInput";
import { BalancesFees } from "./components/BalancesFees";
import { ViewTransaction } from "./ViewTransaction";
import { useQueryClient } from "@tanstack/react-query";
import { useOnboardingSteps } from "../../useOnboardingSteps";
import { Button } from "../../ui/Button";
import { useDirectDepositSubmit } from "./hooks/useDirectDepositSubmit";
import { useStandardBridgeSubmit } from "./hooks/useStandardBridgeSubmit";
import { useGasTankBalance } from "../../useGasTankBalance";
import { usePrevious } from "../../utils/usePrevious";

type DepositMethod = "direct" | "bridge" | "relay" | null;

export function DepositContent() {
  const { chain } = useConfig();
  const queryClient = useQueryClient();
  const { resetStep } = useOnboardingSteps();
  const userAccount = useAccount();
  const userAccountAddress = userAccount.address;
  const userAccountChainId = userAccount?.chain?.id;

  const [success, setSuccess] = useState(false);
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [depositMethod, setDepositMethod] = useState<DepositMethod>();

  const { gasTankBalance } = useGasTankBalance();
  const prevGasTankBalance = usePrevious(gasTankBalance);

  const { data: txHash, writeContractAsync, isPending, error } = useWriteContract();
  const directDeposit = useDirectDepositSubmit(depositAmount, writeContractAsync);
  const standardBridgeDeposit = useStandardBridgeSubmit(depositAmount, writeContractAsync);

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    if (prevGasTankBalance && prevGasTankBalance !== gasTankBalance) {
      setSuccess(true);
    }
  }, [gasTankBalance, prevGasTankBalance]);

  useEffect(() => {
    if (!depositMethod) {
      if (chain.id === userAccountChainId) {
        setDepositMethod("direct");
      } else if (chain.sourceId === userAccountChainId) {
        setDepositMethod("bridge");
      } else {
        setDepositMethod("relay");
      }
    }
  }, [chain.id, chain.sourceId, userAccountChainId, depositMethod]);

  useEffect(() => {
    if (isConfirmed) {
      queryClient.invalidateQueries();
      resetStep();
    }
  }, [isConfirmed, queryClient, resetStep]);

  const handleSubmit = async () => {
    if (depositMethod === "direct") {
      await directDeposit();
    } else if (depositMethod === "bridge") {
      await standardBridgeDeposit();
    } else {
      // TODO: submit relay.link
    }
  };

  return (
    <>
      <AccountModalTitle title="Gas tank" />

      <AccountModalSection>
        <GasTankStateContent amount={depositAmount} isSuccess={success} />
      </AccountModalSection>

      <AccountModalSection>
        <div className="flex flex-col gap-2 p-5">
          {!success && (
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

              <Button
                className="w-full"
                pending={!userAccountAddress || isPending || isConfirming}
                onClick={handleSubmit}
              >
                {isPending && "Confirm in wallet"}
                {isConfirming && "Awaiting network"}
                {!isPending && !isConfirming && "Deposit"}
              </Button>

              {txHash && <ViewTransaction hash={txHash} />}
            </>
          )}

          {success && (
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

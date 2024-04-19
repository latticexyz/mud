import { useState } from "react";
import { useAccount } from "wagmi";
import { useConfig } from "../../AccountKitProvider";
import { AccountModalTitle } from "../../AccoutModalTitle";
import { AccountModalSection } from "../../AccountModalSection";
import { useDepositHandler } from "./hooks/useDepositHandler";
import { GasTankStateContent } from "./GasTankStateContent";
import { ChainSelect } from "./components/ChainSelect";
import { AmountInput } from "./components/AmountInput";
import { BalancesFees } from "./components/BalancesFees";
import { ViewTransaction } from "./ViewTransaction";
import { Button } from "../../ui/Button";

export type DepositMethod = "direct" | "native" | "relay";

export const DEFAULT_DEPOSIT_AMOUNT = 0.005;

export function DepositContent() {
  const { chain } = useConfig();
  const userAccount = useAccount();
  const userAccountAddress = userAccount.address;
  const userAccountChainId = userAccount?.chain?.id;
  const [depositAmount, setDepositAmount] = useState<number | undefined>(DEFAULT_DEPOSIT_AMOUNT);
  const [depositMethod, setDepositMethod] = useState<DepositMethod>(() => {
    if (chain.id === userAccountChainId) return "direct";
    else if (chain.sourceId === userAccountChainId) return "native";
    else return "relay";
  });
  const { txHash, error, deposit, status, isPending, isLoading, isSuccess } = useDepositHandler(depositMethod);

  return (
    <>
      <AccountModalTitle title="Deposit" />

      <GasTankStateContent amount={depositAmount} isSuccess={isSuccess} />

      <AccountModalSection className="h-full">
        <div className="flex flex-col h-full gap-2 p-5">
          {!isSuccess && (
            <form
              onSubmit={async (event) => {
                event.preventDefault();
                await deposit(depositAmount);
              }}
            >
              <p className="pb-2 text-[15px] leading-[140%] dark:color-neutral-300">
                Add funds from your wallet to your tank to fund transactions for any MUD apps on {chain.name}
              </p>

              <div className="flex gap-[12px]">
                <ChainSelect />
                <AmountInput amount={depositAmount} setAmount={setDepositAmount} />
              </div>

              {(depositMethod === "relay" || depositMethod === "native") && (
                <BridgeTabs depositMethod={depositMethod} setDepositMethod={setDepositMethod} />
              )}

              <BalancesFees amount={depositAmount} depositMethod={depositMethod} />

              {error ? (
                <pre className="p-5 my-2 break-all whitespace-pre-wrap bg-red-200 text-red-700 border border-red-700">
                  {String(error)}
                </pre>
              ) : null}
              <Button type="submit" className="w-full mt-[8px]" pending={!userAccountAddress || isPending || isLoading}>
                {isPending && "Confirm in wallet"}
                {isLoading && "Awaiting network"}
                {!isPending && !isLoading && "Deposit"}
              </Button>

              {txHash && <ViewTransaction hash={txHash} status={status} />}
            </form>
          )}

          {isSuccess && (
            <>
              <h3 className="text-[18px] font-semibold leading-[130%] dark:text-white">You’re good to go!</h3>
              <p className="mt-[6px]  text-[15px] leading-[140%] dark:text-neutral-300">
                You can now use this to fund any of your transactions on MUD apps deployed to Chain Name. We have
                estimated of the number of transactions you can take above.
              </p>

              <div className="flex justify-between gap-[10px] h-full">
                <Button className="w-full self-end" variant="tertiary">
                  Deposit more
                </Button>
                <Button className="w-full self-end">Continue</Button>
              </div>
            </>
          )}
        </div>
      </AccountModalSection>
    </>
  );
}

// TODO: wip
const BridgeTabs = ({
  depositMethod,
  setDepositMethod,
}: {
  depositMethod: DepositMethod;
  setDepositMethod: (depositMethod: DepositMethod) => void;
}) => {
  return (
    <div className="flex justify-between mt-[8px]">
      <Button
        className="w-full"
        size="sm"
        variant={depositMethod === "native" ? "secondary" : "tertiary"}
        onClick={() => {
          setDepositMethod("native");
        }}
      >
        Native
      </Button>

      <Button
        className="w-full"
        size="sm"
        variant={depositMethod === "relay" ? "secondary" : "tertiary"}
        onClick={() => {
          setDepositMethod("relay");
        }}
      >
        Relay
      </Button>
    </div>
  );
};

export default BridgeTabs;

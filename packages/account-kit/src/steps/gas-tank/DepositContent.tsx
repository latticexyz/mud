import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useConfig } from "../../AccountKitProvider";
import { RelayLinkContent } from "./RelayLinkContent";
import { StandardBridgeContent } from "./StandardBridgeContent";
import { DirectDepositContent } from "./DirectDepositContent";
import { AccountModalTitle } from "../../AccoutModalTitle";
import { AccountModalSection } from "../../AccountModalSection";
import { GasTankStateContent } from "./GasTankStateContent";

type DepositMethod = "direct" | "bridge" | "relay" | null;

export function DepositContent() {
  const { chain } = useConfig();
  const userAccount = useAccount();
  const userAccountChainId = userAccount?.chain?.id;
  const [depositMethod, setDepositMethod] = useState<DepositMethod>();
  const [depositAmount, setDepositAmount] = useState<bigint | null>();

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

  return (
    <>
      <AccountModalTitle title="Gas tank" />

      <AccountModalSection>
        <GasTankStateContent amount={depositAmount || BigInt(0)} />
      </AccountModalSection>

      <AccountModalSection>
        <div className="flex flex-col gap-2 p-5">
          <p className="pb-2">
            Add funds from your wallet to your tank to fund transactions for any MUD apps on Chain Name.
          </p>

          {chain.id === userAccountChainId && (
            <DirectDepositContent amount={depositAmount || BigInt(0)} setAmount={setDepositAmount} />
          )}
          {chain.sourceId === userAccountChainId && <StandardBridgeContent />}
          {chain.id !== userAccountChainId && chain.sourceId !== userAccountChainId && <RelayLinkContent />}
        </div>
      </AccountModalSection>
    </>
  );
}

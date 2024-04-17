import { useAccount } from "wagmi";
import { useConfig } from "../../AccountKitProvider";
import { RelayLinkContent } from "./RelayLinkContent";
import { StandardBridgeContent } from "./StandardBridgeContent";
import { DirectDepositContent } from "./DirectDepositContent.1";
import { AccountModalSection } from "../../AccountModalSection";
import { AccountModalTitle } from "../../AccoutModalTitle";
import { GasTankStateContent } from "./GasTankStateContent";

export function GasAllowanceContent() {
  const { chain } = useConfig();
  const userAccount = useAccount();
  const userAccountChainId = userAccount?.chain?.id;

  return (
    <>
      <AccountModalTitle title="Gas tank" />

      <AccountModalSection>
        <GasTankStateContent />
      </AccountModalSection>

      <AccountModalSection>
        <div className="flex flex-col gap-2 p-5">
          <p>Add funds from your wallet to your tank to fund transactions for any MUD apps on Chain Name.</p>

          {chain.id === userAccountChainId && <DirectDepositContent />}
          {chain.sourceId === userAccountChainId && <StandardBridgeContent />}
          {chain.id !== userAccountChainId && chain.sourceId !== userAccountChainId && <RelayLinkContent />}
        </div>
      </AccountModalSection>
    </>
  );
}

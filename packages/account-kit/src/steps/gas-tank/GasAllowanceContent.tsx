import { useAccount } from "wagmi";
import { useConfig } from "../../AccountKitProvider";
import { RelayLinkContent } from "./RelayLinkContent";
import { StandardBridgeContent } from "./StandardBridgeContent";
import { DirectDepositContent } from "./DirectDepositContent";
import { AccountModalSection } from "../../AccountModalSection";

export function GasAllowanceContent() {
  const { chain } = useConfig();
  const userAccount = useAccount();
  const userAccountChainId = userAccount?.chain?.id;

  return (
    <AccountModalSection>
      <div className="flex flex-col gap-2">
        {chain.id === userAccountChainId && <DirectDepositContent />}
        {chain.sourceId === userAccountChainId && <StandardBridgeContent />}
        {chain.id !== userAccountChainId && chain.sourceId !== userAccountChainId && <RelayLinkContent />}
      </div>
    </AccountModalSection>
  );
}

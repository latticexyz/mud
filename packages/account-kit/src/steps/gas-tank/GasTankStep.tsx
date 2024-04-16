import { useAccount } from "wagmi";
import { useConfig } from "../../AccountKitProvider";
import { RelayLinkContent } from "./RelayLinkContent";
import { StandardBridgeContent } from "./StandardBridgeContent";
import { DirectDepositContent } from "./DirectDepositContent";
import { useGasTankBalance } from "../../useGasTankBalance";
import { PendingIcon } from "../../icons/PendingIcon";
import { parseEther } from "viem";
import { useIsGasSpender } from "../../useIsGasSpender";
import { GasSpenderContent } from "./GasSpenderContent";

export function GasTankStep() {
  const { chain } = useConfig();
  const userAccount = useAccount();
  const userAccountChainId = userAccount?.chain?.id;
  const balance = useGasTankBalance();
  const isGasSpender = useIsGasSpender();

  if (balance == null || isGasSpender == null) {
    // TODO: better load state
    return <PendingIcon />;
  }

  // TODO: make min balance configurable
  // TODO: allow passing in gas per action, min actions
  if (balance < parseEther("0.001")) {
    return (
      <>
        {chain.id === userAccountChainId && <DirectDepositContent />}
        {chain.sourceId === userAccountChainId && <StandardBridgeContent />}
        {chain.id !== userAccountChainId && chain.sourceId !== userAccountChainId && <RelayLinkContent />}
      </>
    );
  }

  if (!isGasSpender) {
    return <GasSpenderContent />;
  }

  return <>TODO: show completed state</>;
}

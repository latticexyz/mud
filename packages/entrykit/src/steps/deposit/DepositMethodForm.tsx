import { assertExhaustive } from "@latticexyz/common/utils";
import { type Props as DepositFormProps } from "./DepositForm";
import { DepositViaBridgeForm } from "./DepositViaBridgeForm";
import { DepositViaRelayForm } from "./DepositViaRelayForm";
import { DepositViaTransferForm } from "./DepositViaTransferForm";

export type Props = Pick<
  DepositFormProps,
  "sourceChain" | "setSourceChainId" | "amount" | "setAmount" | "depositMethod" | "setDepositMethod"
>;

export function DepositMethodForm(props: Props) {
  switch (props.depositMethod) {
    case "transfer":
      return <DepositViaTransferForm {...props} />;
    case "bridge":
      return <DepositViaBridgeForm {...props} />;
    case "relay":
      return <DepositViaRelayForm {...props} />;
    default:
      assertExhaustive(props.depositMethod);
  }
}

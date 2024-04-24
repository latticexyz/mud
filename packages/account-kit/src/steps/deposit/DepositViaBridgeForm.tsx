import { DepositForm } from "./DepositForm";
import { useSimulateContract, useWriteContract } from "wagmi";
import { useAppAccountClient } from "../../useAppAccountClient";
import { type Props } from "./DepositMethodForm";
import { portal2Abi } from "./abis";

export function DepositViaBridgeForm(props: Props) {
  const { data: appAccountClient } = useAppAccountClient();
  const appAccountAddress = appAccountClient?.account.address;
  const portalAddress = props.sourceChain.portalAddress;

  // TODO: estimate

  const simulate = useSimulateContract({
    chainId: props.sourceChain.id,
    address: portalAddress,
    abi: portal2Abi,
    functionName: "depositTransaction",
    // TODO: what should the gas limit be here?
    args: [
      // to
      appAccountAddress!,
      // value
      props.amount!,
      // gasLimit
      1_000_000n,
      // isCreation
      false,
      // data
      "0x",
    ],
    value: props.amount!,
    query: {
      enabled: !!(appAccountAddress && props.amount && props.amount > 0n),
    },
  });

  const request = simulate.data?.request;
  const write = useWriteContract();

  console.log("simulate", simulate.data, simulate.error);

  return (
    <DepositForm
      {...props}
      estimatedFee={undefined}
      estimatedTime={undefined}
      // TODO: rework to disable when idle (can't prepare)
      pending={simulate.isPending}
      submitButtonLabel="Deposit via bridge"
      onSubmit={
        request
          ? async () => {
              await write.writeContractAsync(request);
            }
          : undefined
      }
    />
  );
}

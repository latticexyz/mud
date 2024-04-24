import { DepositForm } from "./DepositForm";
import { useWalletClient, useWriteContract } from "wagmi";
import { useAppAccountClient } from "../../useAppAccountClient";
import { type Props } from "./DepositMethodForm";
import { useMutation, useQuery } from "@tanstack/react-query";
import { publicActionsL1, publicActionsL2, walletActionsL1, walletActionsL2 } from "viem/op-stack";
import { useAppChain } from "../../useAppChain";

export function DepositViaBridgeForm(props: Props) {
  const { data: appAccountClient } = useAppAccountClient();
  const appAccountAddress = appAccountClient?.account.address;

  console.log("sourceChain", props.sourceChain.id);
  console.log("appChain", useAppChain());

  const { data: initialUserAccountClient } = useWalletClient({ chainId: props.sourceChain.id });

  const userAccountClient = initialUserAccountClient
    ?.extend(publicActionsL1())
    .extend(publicActionsL2())
    .extend(walletActionsL1())
    .extend(walletActionsL2());

  const portalAddress = props.sourceChain.portalAddress;

  const queryKey = [
    "depositViaBridge",
    appAccountAddress,
    userAccountClient?.chain.id,
    userAccountClient?.account.address,
    // portalAddress,
    props.amount?.toString(),
  ];

  const prepare = useQuery(
    userAccountClient && portalAddress && props.amount
      ? {
          queryKey,
          queryFn: async () => {
            console.log("building deposit request");
            const depositRequest = await userAccountClient.buildDepositTransaction({
              account: appAccountAddress,
              mint: props.amount,
            });
            console.log("deposit request", depositRequest);
            console.log("estimating gas");
            const estimatedFee = await userAccountClient.estimateDepositTransactionGas(depositRequest);
            console.log("gestimated gas", estimatedFee);
            return { depositRequest, estimatedFee };
          },
        }
      : { queryKey, enabled: false },
  );

  console.log("prepared", prepare.data, prepare.error, appAccountClient && portalAddress && props.amount);
  // const deposit = useMutation({
  //   // TODO: mutationKey
  //   mutationFn: () => {
  //     const opClient = appAccountClient.extend(opl1);
  //   },
  // });

  // TODO: ideally this should pipe in a QueryResult for estimated fee/time and a MutationResult for sending the tx with Hex as its return type

  return (
    <DepositForm
      {...props}
      estimatedFee={undefined}
      estimatedTime={undefined}
      // pending={write.isPending}
      submitButtonLabel="Deposit via bridge"
      onSubmit={
        appAccountClient && portalAddress
          ? async () => {
              // TODO: I wanna pass in the prepared transaction here, but TS complains
              // await write.writeContractAsync({
              //   chainId: props.sourceChain.id,
              //   address: portalAddress,
              //   abi: portalA,
              // });
            }
          : undefined
      }
    />
  );
}

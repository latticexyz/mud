import { DepositForm } from "./DepositForm";
import { useWalletClient } from "wagmi";
import { useAppAccountClient } from "../../useAppAccountClient";
import { type Props } from "./DepositMethodForm";
import { SubmitButton } from "./SubmitButton";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAppChain } from "../../useAppChain";
import { RelayChain, BridgeActionParameters, GetBridgeQuoteParameters } from "@reservoir0x/relay-sdk";
import { useRelay } from "./useRelay";
import { useDeposits } from "./useDeposits";
import { Chain, Hex } from "viem";

export type DepositMethod = "transfer" | "bridge" | "relay";

export type SourceChain = Chain & {
  depositMethods: readonly DepositMethod[];
  portalAddress: Hex | undefined;
  relayChain: RelayChain | undefined;
};

export type DepositFormProps = {
  sourceChain: SourceChain;
  setSourceChainId: (chainId: number) => void;
  amount: bigint | undefined;
  setAmount: (amount: bigint | undefined) => void;
  depositMethod: DepositMethod;
  setDepositMethod: (depositMethod: DepositMethod) => void;
  // TODO: add errors
  estimatedFee: {
    fee?: bigint | undefined;
    isLoading?: boolean | undefined;
    error: Error | undefined;
  };
  estimatedTime: string;
  submitButton: ReactNode;
  onSubmit: () => Promise<void>;
};

export type Props = Pick<
  DepositFormProps,
  "sourceChain" | "setSourceChainId" | "amount" | "setAmount" | "depositMethod" | "setDepositMethod"
>;

export function Deposit(props: Props) {
  const appChain = useAppChain();
  const { data: appAccountClient } = useAppAccountClient();
  const { data: walletClient } = useWalletClient();
  const { data: relay } = useRelay();
  const relayClient = relay?.client;
  const { addDeposit } = useDeposits();

  if (appAccountClient?.type === "smartAccountClient") {
    // TODO: wire this up differently to make a `depositTo` call on gas tank
    throw new Error("Smart accounts not yet supported with Relay deposits.");
  }

  const relayChain = props.sourceChain.relayChain;
  // TODO: this might be too aggressive if we're in the middle of loading these chains, unclear if the upstream components will prevent this one from loading in that case
  if (!relayChain) throw new Error(`No Relay chain found for chain ID ${props.sourceChain.id}.`);

  // we should never get here if we have a relay chain, because they're created at the same time
  if (!relayClient) throw new Error("No Relay client found.");

  // TODO: get solver capacity for `user.maxBridgeAmount`

  const queryKey = [
    "relayBridgeQuote",
    walletClient?.account.address,
    props.sourceChain.id,
    appChain.id,
    props.amount?.toString(),
    appAccountClient?.account.address,
  ];

  const bridgeParams =
    walletClient && appAccountClient && props.amount != null && props.amount > 0n
      ? ({
          wallet: walletClient,
          chainId: props.sourceChain.id,
          toChainId: appChain.id,
          amount: props.amount.toString(),
          currency: "eth",
          recipient: appAccountClient?.account.address,
        } satisfies GetBridgeQuoteParameters)
      : undefined;

  const quote = useQuery(
    bridgeParams
      ? {
          queryKey,
          retry: 1,
          queryFn: async () => {
            // `getBridgeQuote` calls `bridge` with `precheck: true`
            // https://github.com/reservoirprotocol/relay-sdk/blob/24a5da9d9dbdefa64b4b2c05f02ab243b78b3715/packages/sdk/src/methods/getBridgeQuote.ts
            // but `bridge` doesn't narrow the return type
            // https://github.com/reservoirprotocol/relay-sdk/blob/24a5da9d9dbdefa64b4b2c05f02ab243b78b3715/packages/sdk/src/actions/bridge.ts#L112-L121
            // so we'll do that ourselves to make this easier to use downstream
            const result = (await relayClient.methods.getBridgeQuote(bridgeParams)) as Exclude<
              Awaited<ReturnType<typeof relayClient.methods.getBridgeQuote>>,
              true
            >;

            // I have no idea what these errors will say or look like, so I am YOLOing this approach.
            if (result.errors?.length) {
              const messages = result.errors.map((error) => error.message);
              throw new Error(`Error while retrieving Relay bridge quote:\n\n- ${messages.join("\n- ")}`);
            }

            return {
              params: bridgeParams,
              quote: result,
            };
          },
        }
      : { queryKey, enabled: false },
  );

  const bridge = useMutation({
    mutationKey: ["relayBridge"],
    mutationFn: async (params: BridgeActionParameters) => {
      try {
        // This start time isn't very accurate because the `bridge` call below doesn't resolve until everything is complete.
        // Ideally `start` is initialized after the transaction is signed by the user wallet.
        const start = new Date();

        const pendingDeposit = relayClient.actions.bridge({
          ...params,
          // TODO: translate this to something useful
          onProgress(progress) {
            console.log("onProgress", progress);
          },
        });

        // TODO: move this into `onProgress` once we can determine that the tx has been signed and sent to mempool
        addDeposit({
          type: "relay",
          amount: BigInt(params.amount), // ugh
          chainL1Id: params.chainId,
          chainL2Id: params.toChainId,
          start,
          estimatedTime: 1000 * 30,
          depositPromise: pendingDeposit,
          isComplete: pendingDeposit.then(() => undefined),
        });

        return await pendingDeposit;
      } catch (error) {
        console.error("Error while depositing via Relay", error);
        throw error;
      }
    },
  });

  const fee = quote.data?.quote.fees?.gas;
  return (
    <DepositForm
      {...props}
      estimatedFee={{
        fee: fee != null ? BigInt(fee) : undefined,
        isLoading: quote.isLoading,
        error: quote.error ?? undefined,
      }}
      estimatedTime="A few seconds"
      submitButton={
        <SubmitButton chainId={props.sourceChain.id} disabled={!bridgeParams} pending={bridge.isPending}>
          Deposit via Relay
        </SubmitButton>
      }
      onSubmit={async () => {
        console.log("sending bridge request", bridgeParams);
        await bridge.mutateAsync(bridgeParams!);
      }}
    />
  );
}

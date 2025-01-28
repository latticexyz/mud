/* eslint-disable @typescript-eslint/explicit-function-return-type */
import type {
  Account,
  Chain,
  Client,
  EstimateFeesPerGasParameters,
  EstimateFeesPerGasReturnType,
  FeeValuesType,
  PublicActions,
  Transport,
} from "viem";
import { estimateFeesPerGas as viem_estimateFeesPerGas } from "viem/actions";
import { getAction } from "viem/utils";

export type PreparedFeesOptions<
  chain extends Chain | undefined = Chain | undefined,
  chainOverride extends Chain | undefined = undefined,
  type extends FeeValuesType = "eip1559",
> = {
  refreshInterval?: number;
  estimateFeesPerGas?: EstimateFeesPerGasParameters<chain, chainOverride, type>;
};

export function preparedFees<
  chain extends Chain | undefined = Chain | undefined,
  chainOverride extends Chain | undefined = undefined,
  type extends FeeValuesType = "eip1559",
>({ refreshInterval, estimateFeesPerGas }: PreparedFeesOptions<chain, chainOverride, type> = {}): <
  transport extends Transport = Transport,
  account extends Account | undefined = Account | undefined,
>(
  client: Client<transport, chain, account>,
) => Pick<PublicActions<transport, chain, account>, "estimateFeesPerGas"> {
  return (client) => {
    let fees: Promise<EstimateFeesPerGasReturnType<type>>;

    (function populateFees() {
      fees = getAction(client, viem_estimateFeesPerGas, "estimateFeesPerGas")(estimateFeesPerGas);
      fees.then(() => {
        setTimeout(populateFees, refreshInterval);
      });
    })();

    return {
      async estimateFeesPerGas(args) {
        if (args?.type === estimateFeesPerGas?.type && args?.chain === estimateFeesPerGas?.chain) {
          return (await fees) as never;
        }
        return await getAction(client, viem_estimateFeesPerGas, "estimateFeesPerGas")(args);
      },
    };
  };
}

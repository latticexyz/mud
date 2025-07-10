import {
  Chain,
  FeeValuesType,
  GetChainParameter,
  FeeValuesLegacy,
  FeeValuesEIP1559,
  Client,
  Transport,
  Block,
  PrepareTransactionRequestParameters,
  Account,
  ChainFeesFnParameters,
  BaseFeeScalarError,
  ChainEstimateFeesPerGasFnParameters,
  Eip1559FeesNotSupportedError,
  hexToBigInt,
  EstimateMaxPriorityFeePerGasReturnType,
  EstimateMaxPriorityFeePerGasParameters,
  PublicActions,
} from "viem";
import { getBlock, getGasPrice } from "viem/actions";
import { getAction } from "viem/utils";

type EstimateFeesPerGasParameters<
  chain extends Chain | undefined = Chain | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
  type extends FeeValuesType = FeeValuesType,
> = {
  /**
   * The type of fee values to return.
   *
   * - `legacy`: Returns the legacy gas price.
   * - `eip1559`: Returns the max fee per gas and max priority fee per gas.
   *
   * @default 'eip1559'
   */
  type?: type | FeeValuesType | undefined;
} & GetChainParameter<chain, chainOverride>;

type EstimateFeesPerGasReturnType<type extends FeeValuesType = FeeValuesType> =
  | (type extends "legacy" ? FeeValuesLegacy : never)
  | (type extends "eip1559" ? FeeValuesEIP1559 : never);

/**
 * Returns an estimate for the fees per gas (in wei) for a
 * transaction to be likely included in the next block.
 * Defaults to [`chain.fees.estimateFeesPerGas`](/docs/clients/chains#fees-estimatefeespergas) if set.
 *
 * - Docs: https://viem.sh/docs/actions/public/estimateFeesPerGas
 *
 * @param client - Client to use
 * @param parameters - {@link EstimateFeesPerGasParameters}
 * @returns An estimate (in wei) for the fees per gas. {@link EstimateFeesPerGasReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { estimateFeesPerGas } from 'viem/actions'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const maxPriorityFeePerGas = await estimateFeesPerGas(client)
 * // { maxFeePerGas: ..., maxPriorityFeePerGas: ... }
 */
export function estimateFeesPerGas<chain extends Chain, account extends Account | undefined>(
  client: Client<Transport, chain, account>,
): Pick<PublicActions<Transport, chain, account>, "estimateFeesPerGas"> {
  console.log("extending with estimateFeesPerGas");
  return { estimateFeesPerGas: (args) => internal_estimateFeesPerGas(client, args as never) };
}

async function internal_estimateFeesPerGas<
  chain extends Chain | undefined,
  chainOverride extends Chain | undefined,
  type extends FeeValuesType = "eip1559",
>(
  client: Client<Transport, chain>,
  args: EstimateFeesPerGasParameters<chain, chainOverride, type> & {
    block?: Block | undefined;
    request?: PrepareTransactionRequestParameters<Chain, Account> | undefined;
  },
): Promise<EstimateFeesPerGasReturnType<type>> {
  console.log("estimateFeesPerGas", client, args);
  const { block: block_, chain = client.chain, request, type = "eip1559" } = args || {};

  const baseFeeMultiplier = await (async () => {
    if (typeof chain?.fees?.baseFeeMultiplier === "function")
      return chain.fees.baseFeeMultiplier({
        block: block_ as Block,
        client,
        request,
      } as ChainFeesFnParameters);
    return chain?.fees?.baseFeeMultiplier ?? 1.2;
  })();
  if (baseFeeMultiplier < 1) throw new BaseFeeScalarError();

  const decimals = baseFeeMultiplier.toString().split(".")[1]?.length ?? 0;
  const denominator = 10 ** decimals;
  const multiply = (base: bigint) => (base * BigInt(Math.ceil(baseFeeMultiplier * denominator))) / BigInt(denominator);

  const block = block_ ? block_ : await getAction(client, getBlock, "getBlock")({});

  if (typeof chain?.fees?.estimateFeesPerGas === "function") {
    const fees = (await chain.fees.estimateFeesPerGas({
      block: block_ as Block,
      client,
      multiply,
      request,
      type,
    } as ChainEstimateFeesPerGasFnParameters)) as unknown as EstimateFeesPerGasReturnType<type>;

    if (fees !== null) return fees;
  }

  if (type === "eip1559") {
    if (typeof block.baseFeePerGas !== "bigint") throw new Eip1559FeesNotSupportedError();

    const maxPriorityFeePerGas =
      typeof request?.maxPriorityFeePerGas === "bigint"
        ? request.maxPriorityFeePerGas
        : await internal_estimateMaxPriorityFeePerGas(client as Client<Transport, Chain>, {
            block: block as Block,
            chain,
            request,
          });

    const baseFeePerGas = multiply(block.baseFeePerGas);
    const maxFeePerGas = request?.maxFeePerGas ?? baseFeePerGas + maxPriorityFeePerGas;

    return {
      maxFeePerGas,
      maxPriorityFeePerGas,
    } as EstimateFeesPerGasReturnType<type>;
  }

  const gasPrice = request?.gasPrice ?? multiply(await getAction(client, getGasPrice, "getGasPrice")({}));
  return {
    gasPrice,
  } as EstimateFeesPerGasReturnType<type>;
}

async function internal_estimateMaxPriorityFeePerGas<
  chain extends Chain | undefined,
  chainOverride extends Chain | undefined,
>(
  client: Client<Transport, chain>,
  args: EstimateMaxPriorityFeePerGasParameters<chain, chainOverride> & {
    block?: Block | undefined;
    request?: PrepareTransactionRequestParameters<chain, Account | undefined, chainOverride> | undefined;
  },
): Promise<EstimateMaxPriorityFeePerGasReturnType> {
  const { block: block_, chain = client.chain, request } = args || {};

  try {
    const maxPriorityFeePerGas = chain?.fees?.maxPriorityFeePerGas ?? chain?.fees?.defaultPriorityFee;

    if (typeof maxPriorityFeePerGas === "function") {
      const block = block_ || (await getAction(client, getBlock, "getBlock")({}));
      const maxPriorityFeePerGas_ = await maxPriorityFeePerGas({
        block,
        client,
        request,
      } as ChainFeesFnParameters);
      if (maxPriorityFeePerGas_ === null) throw new Error();
      return maxPriorityFeePerGas_;
    }

    if (typeof maxPriorityFeePerGas !== "undefined") return maxPriorityFeePerGas;

    const maxPriorityFeePerGasHex = await client.request({
      method: "eth_maxPriorityFeePerGas",
    });
    return hexToBigInt(maxPriorityFeePerGasHex);
  } catch {
    // If the RPC Provider does not support `eth_maxPriorityFeePerGas`
    // fall back to calculating it manually via `gasPrice - baseFeePerGas`.
    // See: https://github.com/ethereum/pm/issues/328#:~:text=eth_maxPriorityFeePerGas%20after%20London%20will%20effectively%20return%20eth_gasPrice%20%2D%20baseFee
    const [block, gasPrice] = await Promise.all([
      block_ ? Promise.resolve(block_) : getAction(client, getBlock, "getBlock")({}),
      getAction(client, getGasPrice, "getGasPrice")({}),
    ]);

    if (typeof block.baseFeePerGas !== "bigint") throw new Eip1559FeesNotSupportedError();

    const maxPriorityFeePerGas = gasPrice - block.baseFeePerGas;

    if (maxPriorityFeePerGas < 0n) return 0n;
    return maxPriorityFeePerGas;
  }
}

import { BaseError, type Chain, type Client, type Hash, type SendTransactionParameters, type Transport } from "viem";
import {
  type SendUserOperationParameters,
  type SmartAccount,
  sendUserOperation,
  waitForUserOperationReceipt,
} from "viem/account-abstraction";
import { getAction, parseAccount } from "viem/utils";

export type AccountNotFoundErrorType = AccountNotFoundError & {
  name: "AccountNotFoundError";
};
export class AccountNotFoundError extends BaseError {
  constructor({ docsPath }: { docsPath?: string | undefined } = {}) {
    super(
      [
        "Could not find an Account to execute with this Action.",
        "Please provide an Account with the `account` argument on the Action, or by supplying an `account` to the Client.",
      ].join("\n"),
      {
        docsPath,
        docsSlug: "account",
        name: "AccountNotFoundError",
      },
    );
  }
}

/**
 * Creates, signs, and sends a new transaction to the network.
 * This function also allows you to sponsor this transaction if sender is a smartAccount
 *
 * - Docs: https://viem.sh/docs/actions/wallet/sendTransaction.html
 * - Examples: https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/transactions/sending-transactions
 * - JSON-RPC Methods:
 *   - JSON-RPC Accounts: [`eth_sendTransaction`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sendtransaction)
 *   - Local Accounts: [`eth_sendRawTransaction`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sendrawtransaction)
 *
 * @param client - Client to use
 * @param parameters - {@link SendTransactionParameters}
 * @returns The [Transaction](https://viem.sh/docs/glossary/terms.html#transaction) hash.
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { sendTransaction } from 'viem/wallet'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const hash = await sendTransaction(client, {
 *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *   value: 1000000000000000000n,
 * })
 *
 * @example
 * // Account Hoisting
 * import { createWalletClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { mainnet } from 'viem/chains'
 * import { sendTransaction } from 'viem/wallet'
 *
 * const client = createWalletClient({
 *   account: privateKeyToAccount('0x…'),
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const hash = await sendTransaction(client, {
 *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *   value: 1000000000000000000n,
 * })
 */
export async function sendTransaction<
  account extends SmartAccount | undefined,
  chain extends Chain | undefined,
  accountOverride extends SmartAccount | undefined = undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
  calls extends readonly unknown[] = readonly unknown[],
>(
  client: Client<Transport, chain, account>,
  args:
    | SendTransactionParameters<chain, account, chainOverride>
    | SendUserOperationParameters<account, accountOverride, calls>,
): Promise<Hash> {
  let userOpHash: Hash;

  if ("to" in args) {
    const { account: account_ = client.account, data, maxFeePerGas, maxPriorityFeePerGas, to, value, nonce } = args;

    if (!account_) {
      throw new AccountNotFoundError({
        docsPath: "/docs/actions/wallet/sendTransaction",
      });
    }

    const account = parseAccount(account_) as SmartAccount;

    if (!to) throw new Error("Missing to address");

    userOpHash = await getAction(
      client,
      sendUserOperation,
      "sendUserOperation",
    )({
      calls: [
        {
          to,
          value: value || BigInt(0),
          data: data || "0x",
        },
      ],
      account,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce: nonce ? BigInt(nonce) : undefined,
    });
  } else {
    userOpHash = await getAction(
      client,
      sendUserOperation,
      "sendUserOperation",
    )({ ...args } as SendUserOperationParameters<account, accountOverride>);
  }

  const userOperationReceipt = await getAction(
    client,
    waitForUserOperationReceipt,
    "waitForUserOperationReceipt",
  )({
    hash: userOpHash,
  });

  return userOperationReceipt?.receipt.transactionHash;
}

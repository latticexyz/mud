import { z } from "zod";
import { initTRPC } from "@trpc/server";
import { Chain, Client, Hex, LocalAccount, Transport, formatEther, isHex } from "viem";
import { sendTransaction } from "viem/actions";
import { debug } from "./debug";

export type AppContext = {
  client: Client<Transport, Chain>;
  faucetAccount: LocalAccount<string>;
  dripAmount: bigint;
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function createAppRouter() {
  const t = initTRPC.context<AppContext>().create();

  return t.router({
    drip: t.procedure
      .input(
        z.object({
          address: z.string().refine(isHex),
        })
      )
      .mutation(async (opts): Promise<Hex> => {
        const { client, faucetAccount, dripAmount } = opts.ctx;

        const { address } = opts.input;
        const tx = await sendTransaction(client, {
          account: faucetAccount,
          to: address,
          value: dripAmount,
        });

        debug(`Dripped ${formatEther(dripAmount)} ETH from ${faucetAccount.address} to ${address} (tx ${tx})`);

        return tx;
      }),
  });
}

export type AppRouter = ReturnType<typeof createAppRouter>;

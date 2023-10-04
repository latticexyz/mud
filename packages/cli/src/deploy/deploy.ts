import { Hex, createWalletClient, http } from "viem";
import { createDeployer } from "./createDeployer";
import { privateKeyToAccount } from "viem/accounts";

export async function deploy(): Promise<void> {
  const client = createWalletClient({
    transport: http("http://127.0.0.1:8545"),
    account: privateKeyToAccount(process.env.PRIVATE_KEY as Hex),
  });
  await createDeployer({ client });
}

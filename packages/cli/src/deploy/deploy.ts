import { Hex, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { ensureDeployer } from "./deployer";
import { ensureWorldFactory } from "./worldFactory";

export async function deploy(): Promise<void> {
  const client = createWalletClient({
    transport: http("http://127.0.0.1:8545"),
    account: privateKeyToAccount(process.env.PRIVATE_KEY as Hex),
  });
  await ensureDeployer(client);
  await ensureWorldFactory(client);
}

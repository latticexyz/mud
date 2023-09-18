import chalk from "chalk";
import { Wallet } from "ethers";
import { MUDError } from "@latticexyz/common/errors";

export async function confirmNonce(signer: Wallet, nonce: number, pollInterval: number): Promise<void> {
  let remoteNonce = await signer.getTransactionCount();
  let retryCount = 0;
  const maxRetries = 100;
  while (remoteNonce !== nonce && retryCount < maxRetries) {
    console.log(
      chalk.gray(
        `Waiting for transactions to be included before executing postDeployScript (local nonce: ${nonce}, remote nonce: ${remoteNonce}, retry number ${retryCount}/${maxRetries})`
      )
    );
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
    retryCount++;
    remoteNonce = await signer.getTransactionCount();
  }
  if (remoteNonce !== nonce) {
    throw new MUDError(
      "Remote nonce doesn't match local nonce, indicating that not all deploy transactions were included."
    );
  }
}

import { type SetupNetworkResult } from "./setupNetwork";

export type SystemCalls = ReturnType<typeof createSystemCalls>;

export function createSystemCalls({ worldContract, waitForTransaction }: SetupNetworkResult) {
  const increment = async () => {
    const tx = await worldContract.write.increment();
    await waitForTransaction(tx);
  };

  return {
    increment,
  };
}

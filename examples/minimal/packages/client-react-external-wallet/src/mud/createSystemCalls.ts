import { type MUDRead } from "./read";
import { type MUDWrite } from "./write";

export const createSystemCalls = (mudRead: MUDRead, mudWrite: MUDWrite) => ({
  increment: async () => {
    const { request } = await mudWrite.worldContract.simulate.increment();
    const tx = await mudWrite.walletClient.writeContract(request);
    mudRead.waitForTransaction(tx);
  },
});

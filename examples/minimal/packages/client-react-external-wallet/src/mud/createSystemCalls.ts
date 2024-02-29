import { type MUDRead } from "./read";
import { type MUDWrite } from "./write";

export const createSystemCalls = (mudRead: MUDRead, mudWrite: MUDWrite) => ({
  increment: async () => {
    const tx = await mudWrite.worldContract.write.increment();
    mudRead.waitForTransaction(tx);
  },
});

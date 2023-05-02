import { setup } from "./mud/setup";
import { ethers } from "ethers";

const { worldSend, worldContract } = await setup();

// Just for demonstration purposes: we create a global function that can be
// called to invoke the Increment system contract via the world. (See IncrementSystem.sol.)
(window as any).increment = async (key: string) => {
  const tx = await worldSend("increment", [key]);
  tx.wait().then(async () => {
    const syncResult = await worldContract.sync();

    console.log("sync result", syncResult);

    document.getElementById("syncResult")!.innerHTML = String(
      syncResult.map((t) =>
        t.map((s) => {
          const tableId = ethers.utils.parseBytes32String(s[0]);

          return `tableId: ${tableId} | key: ${s[1]} | value: ${s[2]}`;
        })
      )
    );
  });
};

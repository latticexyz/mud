import { TableId } from "@latticexyz/utils";
import { setup } from "./mud/setup";
import { utils } from "ethers";

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
          const tableId = TableId.fromBytes32(utils.arrayify(s[0]));

          return `Table name: ${tableId.name} | Key: ${s[1]} | Value: ${s[2]}`;
        })
      )
    );
  });
};

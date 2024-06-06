import { privateKeyToAccount } from "viem/accounts";
import { RequestData, ResponseData } from "../src/isolated-signer/common";

console.log("hello");

const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const account = privateKeyToAccount(privateKey);

window.addEventListener("message", async (event: MessageEvent<RequestData>) => {
  if (event.data.method === "signMessage") {
    console.log("got sign message request, posting reply to", event.origin);
    event.source?.postMessage(
      {
        type: "reply",
        id: event.data.id,
        result: await account.signMessage(event.data.args),
      } satisfies ResponseData,
      {
        targetOrigin: event.origin,
      },
    );
  }
});

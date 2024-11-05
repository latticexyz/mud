import { onPostMessage } from "./rpc/onPostMessage";

console.log("hello from smartpass");
window.addEventListener("message", onPostMessage);

// import { onPostMessage } from "./rpc/onPostMessage";

import { onPostMessage } from "./rpc/ox";

console.log("hello from smartpass");
window.addEventListener("message", onPostMessage);

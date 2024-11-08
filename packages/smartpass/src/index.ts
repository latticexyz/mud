import { onPostMessage } from "./rpc/onPostMessage";

console.log("hello from smartpass");
window.addEventListener("message", onPostMessage);

const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
const messageContainer = document.querySelector("#message");
if (messageContainer) {
  messageContainer.textContent = hashParams.get("message");
}

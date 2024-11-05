import { methods } from "./rpc/methods";
import { onPostMessage } from "./rpc/onPostMessage";

console.log("hello from smartpass");
window.addEventListener("message", onPostMessage);

const button = document.createElement("button");
button.onclick = () => methods.create();
button.innerHTML = "click";
document.body.appendChild(button);

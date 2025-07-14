import { createCredential } from "ox/WebAuthnP256";

console.log("hello from connect");

const parentWindow = (window.opener ?? window.parent) as Window | null;
console.log("parentWindow", parentWindow);

window.addEventListener("beforeunload", () => {
  console.log("beforeunload", window.closed);
  if (parentWindow) parentWindow.postMessage("window.beforeunload", { targetOrigin: "*" });
});

window.addEventListener("close", () => {
  console.log("close", window.closed);
  if (parentWindow) parentWindow.postMessage("window.close", { targetOrigin: "*" });
});

window.addEventListener("blur", () => {
  console.log("blur");
  if (parentWindow) parentWindow.postMessage("window.blur", { targetOrigin: "*" });
});

const button = document.createElement("button");
button.textContent = "create";
button.onclick = () => {
  createCredential({ name: "test" });
};
document.body.appendChild(button);

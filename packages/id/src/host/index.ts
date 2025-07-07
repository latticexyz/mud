import { WebAuthnP256, Hex } from "ox";
import { createMessagePort } from "../sync/createMessagePort";

const opener = window.opener ?? window.parent;

if (opener == null || opener === window) {
  console.log("host loaded");
  (() => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "create";
    button.onclick = async function onClick() {
      await create();
    };
    document.body.appendChild(button);
  })();
  (() => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "sign";
    button.onclick = async function onClick() {
      await sign("0x");
    };
    document.body.appendChild(button);
  })();
} else {
  console.log("host loaded via", opener);
  await initialize();
}

async function initialize() {
  const { port, initialMessage } = await createMessagePort({ target: opener });
  console.log("got port", port, initialMessage);
  port.postMessage("hello from host");

  port.addEventListener("message", async function onMessage(event) {
    console.log("got message from client", event);

    if (event.data === "create") {
      await create();
    } else if (event.data === "sign") {
      await sign("0x");
    }
  });
}

async function create() {
  const credentialId = await (async () => {
    const id = localStorage.getItem("credential-id");
    console.log("credential from localStorage", id);
    if (id) return id;

    console.log("creating credential");
    const credential = await WebAuthnP256.createCredential({
      rp: {
        id: "id.smartpass.dev",
        name: "MUD ID",
      },
      user: {
        name: "Example",
      },
    });
    localStorage.setItem("credential-id", credential.id);
    return credential.id;
  })();

  console.log("got credential ID", credentialId);
}

async function sign(message: Hex.Hex) {
  const id = localStorage.getItem("credential-id");

  console.log("signing with credential", id);
  const signature = await WebAuthnP256.sign({
    credentialId: id ?? undefined,
    challenge: message,
  });
  console.log("got signature", signature);
}

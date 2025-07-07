import { WebAuthnP256, Hex } from "ox";
import { requestMessagePort } from "../messagePort/requestMessagePort";
import { rp } from "./common";
import { syncPort } from "../sync/syncPort";
import { sharedState } from "../sync/sharedState";

const opener = window.opener ?? window.parent;

if (opener == null || opener === window) {
  console.log("rp loaded");
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
  console.log("rp loaded via", opener);
  await connectClient();
}

async function connectClient() {
  const { port, initialMessage } = await requestMessagePort({ target: opener });
  syncPort("client", port);

  setTimeout(() => {
    console.log("updating accounts from rp for funsies");
    sharedState.setState({ accounts: ["0x"] });
  }, 1000);
}

async function create() {
  const credentialId = await (async () => {
    // const id = localStorage.getItem("credential-id");
    // console.log("credential from localStorage", id);
    // if (id) return id;

    console.log("creating credential");
    const credential = await WebAuthnP256.createCredential({
      rp,
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
    rpId: rp.id,
    credentialId: id ?? undefined,
    challenge: message,
  });
  console.log("got signature", signature);
}

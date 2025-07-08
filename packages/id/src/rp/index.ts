import { WebAuthnP256, Hex } from "ox";
import { requestMessagePort } from "../messagePort/requestMessagePort";
import { rp } from "./common";
import { syncPort } from "../sync/syncPort";
import { sharedState } from "../sync/sharedState";
import { debug } from "./debug";
import { getFrameContext } from "../client/connectRp";

const opener = window.opener ?? window.parent;

if (opener == null || opener === window) {
  debug("rp loaded");
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
  await connectClient();
}

async function connectClient() {
  const { id, origin: targetOrigin } = getFrameContext(window.location.href);
  debug("rp loaded", id, "via", targetOrigin, opener);

  const { port } = await requestMessagePort({ id, target: opener, targetOrigin });
  syncPort("client", port);

  port.addEventListener("message", async (event) => {
    if (event.data === "create") {
      await create();
      port.postMessage("createResult");
    }
  });

  sharedState.subscribe((state, prevState) => {
    if (state.accounts !== prevState.accounts) {
      debug("accounts updated by", state.lastUpdate?.by, state.accounts);
    }
  });

  setTimeout(() => {
    debug("updating accounts from rp for funsies");
    sharedState.setState({
      accounts: ["0xrp"],
      lastUpdate: {
        by: "rp",
        at: new Date(),
      },
    });
  }, 10000);
}

async function create() {
  const credentialId = await (async () => {
    // const id = localStorage.getItem("credential-id");
    // debug("credential from localStorage", id);
    // if (id) return id;

    debug("creating credential");
    const credential = await WebAuthnP256.createCredential({
      rp,
      user: {
        name: "Example",
      },
    });
    localStorage.setItem("credential-id", credential.id);
    return credential.id;
  })();

  debug("got credential ID", credentialId);
}

async function sign(message: Hex.Hex) {
  const id = localStorage.getItem("credential-id");

  debug("signing with credential", id);
  const signature = await WebAuthnP256.sign({
    rpId: rp.id,
    credentialId: id ?? undefined,
    challenge: message,
  });
  debug("got signature", signature);
}

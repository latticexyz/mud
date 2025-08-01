import { createHashRouter } from "react-router";
import { Connect } from "./routes/wallet/Connect";
import { NotFound } from "./routes/NotFound";
import { SendCalls } from "./routes/wallet/SendCalls";
import { Home } from "./routes/Home";
import { porto } from "../src/popup/porto";
import { onDialogRequest } from "porto/remote/Events";

export const router = createHashRouter([
  {
    path: "/request/wallet_connect",
    Component: Connect,
  },
  {
    path: "/request/wallet_sendCalls",
    Component: SendCalls,
  },
  { path: "/", Component: Home },
  { path: "*", Component: NotFound },
]);

// TODO: instead of URL params which could be tampered with or linked to from outside our flow, we should
//       store the request somewhere and use the ID to look it up, then we can also store the origin of the message event
//       instead of relying on document.referrer (which may be blank for private sessions)
// TODO: add `origin` to `onDialogRequest` callback
const offDialogRequest = onDialogRequest(porto, ({ request }) => {
  if (request) {
    router.navigate(`/request/${request.method}?${new URLSearchParams({ request: JSON.stringify(request ?? null) })}`, {
      replace: true,
    });
  }
});

porto.ready();

if (import.meta.hot) {
  import.meta.hot.on("vite:beforeUpdate", () => {
    offDialogRequest();
  });
}

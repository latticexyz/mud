import { createMemoryRouter } from "react-router";
import { Connect } from "./routes/wallet/Connect";
import { NotFound } from "./routes/NotFound";
import { SendCalls } from "./routes/wallet/SendCalls";
import { Home } from "./routes/Home";
import { porto } from "../src/popup/porto";
import { onDialogRequest } from "porto/remote/Events";

export const router = createMemoryRouter([
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

const offDialogRequest = onDialogRequest(porto, ({ request }) => {
  if (request) {
    router.navigate(`/request/${request.method}`, {
      state: { request },
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

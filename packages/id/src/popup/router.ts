import { createMemoryRouter } from "react-router";
import { Connect } from "./routes/wallet/Connect";
import { NotFound } from "./routes/NotFound";
import { SendCalls } from "./routes/wallet/SendCalls";

export const router = createMemoryRouter([
  {
    path: "/request/wallet_connect",
    Component: Connect,
  },
  {
    path: "/request/wallet_sendCalls",
    Component: SendCalls,
  },
  { path: "*", Component: NotFound },
]);

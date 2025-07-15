import { createMemoryRouter } from "react-router";
import { Connect } from "./routes/wallet/Connect";
import { NotFound } from "./routes/NotFound";
import { SendCalls } from "./routes/wallet/SendCalls";
import { Home } from "./routes/Home";

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

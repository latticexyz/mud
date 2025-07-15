import { createMemoryRouter } from "react-router";
import { Connect } from "./routes/wallet/Connect";
import { NotFound } from "./routes/NotFound";
import { SignTypedData } from "./routes/eth/SignTypedData";

export const router = createMemoryRouter([
  {
    path: "/request/wallet_connect",
    Component: Connect,
  },
  {
    path: "/request/eth_signTypedData_v4",
    Component: SignTypedData,
  },
  { path: "*", Component: NotFound },
]);

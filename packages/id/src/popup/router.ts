import { createMemoryRouter } from "react-router";
import { Connect } from "./routes/wallet/Connect";
import { NotFound } from "./routes/NotFound";

export const router = createMemoryRouter(
  [
    {
      path: "/request/wallet_connect",
      Component: Connect,
    },
    { path: "*", Component: NotFound },
  ],
  { basename: "/embed/" },
);

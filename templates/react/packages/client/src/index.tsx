import "tailwindcss/tailwind.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { getWorldDeploy } from "./mud/getWorldDeploy";
import { Providers } from "./Providers";
import { App } from "./App";
import { chainId } from "./common";
import { Explorer } from "./mud/Explorer";

// TODO: figure out if we actually want this to be async or if we should render something else in the meantime
getWorldDeploy(chainId).then((worldDeploy) =>
  createRoot(document.getElementById("react-root")!).render(
    <StrictMode>
      <Providers worldDeploy={worldDeploy}>
        <App />
        <Explorer />
      </Providers>
    </StrictMode>,
  ),
);

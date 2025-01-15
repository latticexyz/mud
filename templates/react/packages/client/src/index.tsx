import "tailwindcss/tailwind.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Providers } from "./Providers";
import { App } from "./App";
import { Explorer } from "./mud/Explorer";

createRoot(document.getElementById("react-root")!).render(
  <StrictMode>
    <Providers>
      <App />
      <Explorer />
    </Providers>
  </StrictMode>,
);

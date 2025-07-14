import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { Root } from "../src/popup/Root";

const root = ReactDOM.createRoot(document.querySelector("#react-root")!);
root.render(
  <StrictMode>
    <Root />
  </StrictMode>,
);

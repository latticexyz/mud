import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { Playground } from "./Playground";

const root = ReactDOM.createRoot(document.querySelector("#react-root")!);
root.render(
  <StrictMode>
    <Playground />
  </StrictMode>,
);

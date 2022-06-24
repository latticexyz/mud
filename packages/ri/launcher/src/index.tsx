import React from "react";
import ReactDOM from "react-dom/client";
import { App as AppImport } from "./App";

// Assign variables that can be overridden by HMR
let App = AppImport;

function boot() {
  console.log("Start booting");
  const rootElement = document.getElementById("react-root");
  if (!rootElement) return console.warn("React root not found");
  const root = ReactDOM.createRoot(rootElement);

  function renderEngine() {
    root.render(<App />);
    console.info("Done booting");
  }

  renderEngine();

  if (import.meta.hot) {
    // HMR React
    import.meta.hot.accept("./App.tsx", async (module) => {
      App = module.App;
      renderEngine();
    });
  }
}

boot();

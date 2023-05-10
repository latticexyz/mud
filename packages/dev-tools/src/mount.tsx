export async function mount() {
  if (typeof window === "undefined") {
    console.warn("MUD dev-tools should only be used in browser bundles");
    return;
  }

  try {
    const React = await import("react");
    const ReactDOM = await import("react-dom/client");
    const { App } = await import("./App");

    const rootElement = document.createElement("div");
    rootElement.id = "mud-dev-tools";

    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    document.body.appendChild(rootElement);
  } catch (error) {
    console.error("Failed to mount MUD dev-tools", error);
  }

  // TODO: expose an unmount function?
}

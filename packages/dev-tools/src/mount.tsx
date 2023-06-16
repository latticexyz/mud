const containerId = "mud-dev-tools";

// TODO: rework to always return a unmount function (not a promise or possibly undefined)
export async function mount() {
  if (typeof window === "undefined") {
    console.warn("MUD dev-tools should only be used in browser bundles");
    return;
  }

  if (document.getElementById(containerId)) {
    console.warn("MUD dev-tools is already mounted");
    return;
  }

  try {
    const React = await import("react");
    const ReactDOM = await import("react-dom/client");
    const { App } = await import("./App");

    const rootElement = document.createElement("div");
    rootElement.id = containerId;

    // We shouldn't need to do this with stacking contexts and this being at
    // the end of the DOM, but for some reason, any elements on the page with
    // z-index seem to overlap this.
    // https://web.dev/learn/css/z-index/#stacking-context
    rootElement.style.position = "relative";
    rootElement.style.zIndex = "999999";

    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    document.body.appendChild(rootElement);

    return () => {
      root.unmount();
      rootElement.remove();
    };
  } catch (error) {
    console.error("Failed to mount MUD dev-tools", error);
  }
}

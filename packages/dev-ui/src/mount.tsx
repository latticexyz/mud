export async function mount() {
  if (typeof window === "undefined") {
    console.warn("dev-ui should only be used in browser bundles");
    return;
  }

  const { App } = await import("./App");
  const ReactDOM = await import("react-dom/client");

  const rootElement = document.createElement("div");
  rootElement.id = "mud-dev-ui";

  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);

  document.body.appendChild(rootElement);
}

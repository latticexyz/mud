export async function mount() {
  if (typeof window === "undefined") {
    console.warn("dev-ui should only be used in browser bundles");
    return;
  }

  const React = await import("react");
  const ReactDOM = await import("react-dom/client");
  const { router } = await import("./router");
  const { RouterProvider } = await import("react-router-dom");

  const rootElement = document.createElement("div");
  rootElement.id = "mud-dev-ui";

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );

  document.body.appendChild(rootElement);

  // TODO: expose an unmount function?
}

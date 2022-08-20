const { JSX } = require("typedoc");

exports.load = function load(app) {
  app.renderer.hooks.on("head.begin", () => {
    return JSX.createElement("script", null,
      JSX.createElement(JSX.Raw, { html: "localStorage.setItem('tsd-theme', 'dark')" }));
  });
}
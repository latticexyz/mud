/* eslint-disable @typescript-eslint/no-explicit-any */
import { createHeadlessLayer as createHeadlessLayerImport, HeadlessLayer } from "./layers/Headless";
import { createNetworkLayer as createNetworkLayerImport, NetworkLayer } from "./layers/Network";
import { createLocalLayer as createLocalLayerImport, LocalLayer } from "./layers/Local";
import { createPhaserLayer as createPhaserLayerImport, PhaserLayer } from "./layers/Renderer/Phaser";
import { Engine as EngineImport } from "./layers/Renderer/React/engine/Engine";
import { registerUIComponents as registerUIComponentsImport } from "./layers/Renderer/React/components";
import { Layers } from "./layers/Renderer/React/engine/types";
import { getComponentValue, removeComponent, setComponent } from "@latticexyz/recs";
import React from "react";
import ReactDOM from "react-dom/client";
import { Time } from "./utils/time";

// Assign variables that can be overridden by HMR
let createNetworkLayer = createNetworkLayerImport;
let createHeadlessLayer = createHeadlessLayerImport;
let createLocalLayer = createLocalLayerImport;
let createPhaserLayer = createPhaserLayerImport;
let Engine = EngineImport;
let registerUIComponents = registerUIComponentsImport;

/**
 * This function is called once when the game boots up.
 * It creates all the layers and their hierarchy.
 * Add new layers here.
 */
async function bootLayers() {
  const layers: {
    network?: NetworkLayer;
    headless?: HeadlessLayer;
    local?: LocalLayer;
    phaser?: PhaserLayer;
  } = {};

  async function bootLayers() {
    if (!layers.network) layers.network = await createNetworkLayer();
    if (!layers.headless) layers.headless = await createHeadlessLayer(layers.network);
    if (!layers.local) layers.local = await createLocalLayer(layers.headless);
    if (!layers.phaser) layers.phaser = await createPhaserLayer(layers.local);

    // Sync global time with phaser clock
    Time.time.setPacemaker((setTimestamp) => {
      layers.phaser?.game.events.on("poststep", (time: number) => {
        setTimestamp(time);
      });
    });

    // Make sure there is only one canvas.
    // Ideally HMR should handle this, but in some cases it fails.
    // If there are two canvas elements, do a full reload.
    if (document.querySelectorAll("#phaser-game canvas").length > 1) {
      console.log("Detected two canvas elements, full reload");
      import.meta.hot?.invalidate();
    }
  }

  function disposeLayer(layer: keyof typeof layers) {
    layers[layer]?.world.dispose();
    layers[layer] = undefined;
  }

  await bootLayers();

  (window as any).layers = layers;

  const ecs = {
    setComponent,
    removeComponent,
    getComponentValue,
  };

  (window as any).ecs = ecs;
  (window as any).time = Time.time;

  if (import.meta.hot) {
    // HMR Network layer
    import.meta.hot.accept("./layers/Network/index.ts", async (module) => {
      createNetworkLayer = module.createNetworkLayer;
      disposeLayer("network");
      disposeLayer("headless");
      disposeLayer("local");
      disposeLayer("phaser");
      await bootLayers();
      console.log("HMR Network");
    });

    // HMR Headless layer
    import.meta.hot.accept("./layers/Headless/index.ts", async (module) => {
      createHeadlessLayer = module.createHeadlessLayer;
      disposeLayer("headless");
      disposeLayer("local");
      disposeLayer("phaser");
      await bootLayers();
      console.log("HMR Headless");
    });

    // HMR Local layer
    import.meta.hot.accept("./layers/Local/index.ts", async (module) => {
      createLocalLayer = module.createLocalLayer;
      disposeLayer("local");
      disposeLayer("phaser");
      await bootLayers();
      console.log("HMR Local");
    });

    // HMR Phaser layer
    import.meta.hot.accept("./layers/Renderer/Phaser/index.ts", async (module) => {
      createPhaserLayer = module.createPhaserLayer;
      disposeLayer("phaser");
      await bootLayers();
      console.log("HMR Phaser");
    });
  }
  console.log("booted");

  return { layers, ecs };
}

function bootReact(layers: Layers) {
  const rootElement = document.getElementById("react-root");
  if (!rootElement) return console.warn("React root not found");
  const root = ReactDOM.createRoot(rootElement);

  function renderEngine() {
    root.render(<Engine layers={layers} />);
  }

  renderEngine();
  registerUIComponents();

  if (import.meta.hot) {
    // HMR React engine
    import.meta.hot.accept("./layers/Renderer/React/engine/Engine.tsx", async (module) => {
      Engine = module.Engine;
      renderEngine();
    });
  }

  if (import.meta.hot) {
    // HMR React components
    import.meta.hot.accept("./layers/Renderer/React/components/index.ts", async (module) => {
      registerUIComponents = module.registerUIComponents;
      registerUIComponents();
    });
  }
}

export async function boot() {
  const { layers } = await bootLayers();
  bootReact(layers as Layers);
}

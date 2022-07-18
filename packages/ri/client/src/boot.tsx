/* eslint-disable @typescript-eslint/no-explicit-any */
import { getComponentValue, removeComponent, setComponent } from "@latticexyz/recs";
import React from "react";
import ReactDOM from "react-dom/client";
import { Time } from "./utils/time";
import { Main as MainImport } from "./Main";
import { Engine as EngineImport } from "./React/engine/Engine";
import { registerUIComponents as registerUIComponentsImport } from "./React/components";
import { Game } from "./types";

// Assign variables that can be overridden by HMR
let Main = MainImport;
let Engine = EngineImport;
let registerUIComponents = registerUIComponentsImport;

/**
 * This function is called once when the game boots up.
 * It creates all the layers and their hierarchy.
 * Add new layers here.
 */
async function bootGame() {
  const game: Partial<Game> = {};
  let initialBoot = true;

  async function rebootGame(): Promise<Game> {
    // Remove react when starting to reboot layers, reboot react once layers are rebooted
    mountReact.current(false);

    const params = new URLSearchParams(window.location.search);
    const worldAddress = params.get("worldAddress");
    const privateKey = params.get("burnerWalletPrivateKey");
    const chainIdString = params.get("chainId");
    const jsonRpc = params.get("rpc") || undefined;
    const wsRpc = params.get("wsRpc") || undefined; // || (jsonRpc && jsonRpc.replace("http", "ws"));
    const checkpointUrl = params.get("checkpoint") || undefined;
    const devMode = params.get("dev") === "true";
    const initialBlockNumberString = params.get("initialBlockNumber");
    const initialBlockNumber = initialBlockNumberString ? parseInt(initialBlockNumberString) : 0;

    let networkLayerConfig;
    if (worldAddress && privateKey && chainIdString && jsonRpc) {
      networkLayerConfig = {
        worldAddress,
        privateKey,
        chainId: parseInt(chainIdString),
        jsonRpc,
        wsRpc,
        checkpointUrl,
        devMode,
        initialBlockNumber,
      };
    }

    if (!networkLayerConfig) throw new Error("Invalid config");

    if (!game.current) game.current = await Main(networkLayerConfig);

    // Sync global time with phaser clock
    Time.time.setPacemaker((setTimestamp) => {
      game.current?.game.events.on("poststep", (time: number) => {
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

    // Start syncing once all systems have booted
    if (initialBoot) {
      initialBoot = false;
      game.current?.startSync();
    }

    // Reboot react if layers have changed
    mountReact.current(true);

    return game as Game;
  }

  function dispose() {
    game.current?.world.dispose();
    game.current = undefined;
  }

  await rebootGame();

  const ecs = {
    setComponent,
    removeComponent,
    getComponentValue,
  };

  (window as any).game = game;
  (window as any).ecs = ecs;
  (window as any).time = Time.time;

  let reloading = false;

  if (import.meta.hot) {
    import.meta.hot.accept("./Main.ts", async (module) => {
      if (reloading) return;
      reloading = true;
      Main = module.Main;
      dispose();
      await rebootGame();
      console.log("HMR Game");
      game.current?.startSync();
      reloading = false;
    });
  }
  console.log("booted");

  return { game, ecs };
}

const mountReact: { current: (mount: boolean) => void } = { current: () => void 0 };

function bootReact(game: Game) {
  const rootElement = document.getElementById("react-root");
  if (!rootElement) return console.warn("React root not found");

  const root = ReactDOM.createRoot(rootElement);

  function renderEngine() {
    root.render(<Engine game={game} mountReact={mountReact} />);
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
  const { game } = await bootGame();
  bootReact(game as Game);
}

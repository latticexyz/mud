import { Browser, createBrowserDevComponents } from "@latticexyz/ecs-browser";
import { useMUD } from "../store";
import { ClickWrapper } from "./theme/ClickWrapper";

export const ECSBrowser = () => {
  const layers = useMUD();

  const {
    networkLayer: { world },
    devMode,
  } = layers;

  const components = createBrowserDevComponents(world);

  return (
    <>
      {devMode && (
        <ClickWrapper
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            height: "100%",
            width: "320px",
          }}
        >
          <Browser
            world={world}
            layers={{
              phaser: layers.phaserLayer,
              network: layers.networkLayer,
            }}
            devHighlightComponent={components.devHighlightComponent}
            hoverHighlightComponent={components.hoverHighlightComponent}
          />
        </ClickWrapper>
      )}
    </>
  );
};

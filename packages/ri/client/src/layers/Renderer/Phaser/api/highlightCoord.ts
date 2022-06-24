import { WorldCoord } from "@latticexyz/phaserx/src/types";
import { setComponent } from "@latticexyz/recs";
import { PhaserLayer } from "../types";

export function highlightCoord(layer: PhaserLayer, coord: WorldCoord) {
  const {
    components: { HoverHighlight },
    parentLayers: {
      local: { singletonEntity },
    },
  } = layer;

  setComponent(HoverHighlight, singletonEntity, { color: 0xb00b1e, ...coord });
}

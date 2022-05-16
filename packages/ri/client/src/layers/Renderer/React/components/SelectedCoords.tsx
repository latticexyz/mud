import React from "react";
import { registerUIComponent } from "../engine";
import { getComponentValue } from "@mud/recs";

export function registerSelectedCoords() {
  registerUIComponent(
    "SelectedCoords",
    (layers) => {
      const {
        components: { Selection },
        singletonEntity,
      } = layers.local;
      const selection = getComponentValue(Selection, singletonEntity);
      if (selection && selection.height > 0 && selection.width > 0) return selection;
    },
    (selection) => {
      return <>Selected coords: {JSON.stringify(selection)}</>;
    }
  );
}

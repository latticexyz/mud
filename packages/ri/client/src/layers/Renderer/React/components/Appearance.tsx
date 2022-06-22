import React from "react";
import { getComponentValue } from "@latticexyz/recs";
import { registerUIComponent, Spritesheet } from "../engine";
import imp from "../../assets/imp.png";

const sprites: { [key: string]: { spriteWidth: number; imgPath: string; nFrames: number } | undefined } = {
  Imp: { spriteWidth: 24, imgPath: imp, nFrames: 4 },
};

export function registerAppearance() {
  registerUIComponent(
    "Appearance",
    (layers, selectedEntities) => {
      if (selectedEntities.size !== 1) return;
      const selectedEntity = [...selectedEntities][0];
      const { Appearance } = layers.phaser.components;
      const appearance = getComponentValue(Appearance, selectedEntity);
      if (!appearance) return;
      return sprites[appearance.value];
    },
    (sprite) => {
      return (
        <>
          Entity: <Spritesheet {...sprite} />
        </>
      );
    }
  );
}

import { defineScene } from "@mudkit/phaserx";
import { Scenes } from "../constants";

/**
 * Define scenes to be added to the phaser games
 */
export function defineMainScene() {
  return {
    [Scenes.Main]: defineScene({
      key: Scenes.Main,
      preload: () => {
        // Stuff to preload
      },
      create: () => {
        // Stuff to do once when the scene is loaded
      },
      update: () => {
        // Stuff to do 60 times per second
      },
    }),
  };
}

import { ReactElement } from "react";
import { Entity } from "@latticexyz/recs";
import { HeadlessLayer } from "../../../Headless";
import { LocalLayer } from "../../../Local";
import { NetworkLayer } from "../../../Network";
import { PhaserLayer } from "../../Phaser";

export type Layers = {
  network: NetworkLayer;
  headless: HeadlessLayer;
  local: LocalLayer;
  phaser: PhaserLayer;
};

export type GridConfiguration = { colStart: number; colEnd: number; rowStart: number; rowEnd: number };

export interface UIComponent<T> {
  gridConfig: GridConfiguration;
  requirement(layers: Layers, selectedEntities: Set<Entity>): T | null | undefined;
  render(props: NonNullable<T>): ReactElement | null;
}

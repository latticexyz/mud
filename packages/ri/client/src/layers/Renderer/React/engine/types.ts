import { ReactElement } from "react";
import { HeadlessLayer } from "../../../Headless";
import { LocalLayer } from "../../../Local";
import { NetworkLayer } from "../../../Network";
import { PhaserLayer } from "../../Phaser";
import { Observable } from "rxjs";

export type Layers = {
  network: NetworkLayer;
  headless: HeadlessLayer;
  local: LocalLayer;
  phaser: PhaserLayer;
};

export type GridConfiguration = { colStart: number; colEnd: number; rowStart: number; rowEnd: number };

export interface UIComponent<T = unknown> {
  gridConfig: GridConfiguration;
  requirement(layers: Layers): Observable<T>;
  render(props: NonNullable<T>): ReactElement | null;
}

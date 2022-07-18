import { ReactElement } from "react";
import { Observable } from "rxjs";
import { Game } from "../../types";

export type GridConfiguration = { colStart: number; colEnd: number; rowStart: number; rowEnd: number };

export interface UIComponent<T = unknown> {
  gridConfig: GridConfiguration;
  requirement(game: Game): Observable<T>;
  render(props: NonNullable<T>): ReactElement | null;
}

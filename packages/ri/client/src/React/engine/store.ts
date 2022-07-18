import { observable, action } from "mobx";
import { Observable } from "rxjs";
import { Game } from "../../types";
import { GridConfiguration, UIComponent } from "./types";

export const EngineStore = observable({
  UIComponents: new Map<string, UIComponent>(),
});

export const registerUIComponent = action(
  <T>(
    id: string,
    gridConfig: GridConfiguration,
    requirement: (game: Game) => Observable<T>,
    render: UIComponent<T>["render"]
  ) => {
    EngineStore.UIComponents.set(id, { requirement, render, gridConfig });
  }
);

import { observable, action } from "mobx";
import { Observable } from "rxjs";
import { GridConfiguration, Layers, UIComponent } from "./types";

export const EngineStore = observable({
  UIComponents: new Map<string, UIComponent>(),
});

export const registerUIComponent = action(
  <T>(
    id: string,
    gridConfig: GridConfiguration,
    requirement: (layers: Layers) => Observable<T>,
    render: UIComponent<T>["render"]
  ) => {
    EngineStore.UIComponents.set(id, { requirement, render, gridConfig });
  }
);

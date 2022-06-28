import { observable, action } from "mobx";
import { GridConfiguration, UIComponent } from "./types";

export const EngineStore = observable({
  UIComponents: new Map<string, UIComponent<unknown>>(),
});

export const registerUIComponent = action(
  <T>(
    id: string,
    gridConfig: GridConfiguration,
    requirement: UIComponent<T>["requirement"],
    render: UIComponent<T>["render"]
  ) => {
    EngineStore.UIComponents.set(id, { requirement, render, gridConfig });
  }
);

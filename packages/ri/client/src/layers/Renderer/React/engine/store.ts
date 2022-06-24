import { observable, action } from "mobx";
import { GridConfiguration, UIComponent } from "./types";
import { Entity } from "@latticexyz/recs";

export const EngineStore = observable({
  UIComponents: new Map<string, UIComponent<unknown>>(),
  previewEntity: undefined as Entity | undefined,
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

export const setPreviewEntity = action((entity: Entity | undefined) => {
  EngineStore.previewEntity = entity;
});

import { observable, action } from "mobx";
import { UIComponent } from "./types";
import { Entity } from "@mud/recs";

export const EngineStore = observable({
  UIComponents: new Map<string, UIComponent<unknown>>(),
  previewEntity: undefined as Entity | undefined,
});

export const registerUIComponent = action(
  <T>(id: string, requirement: UIComponent<T>["requirement"], render: UIComponent<T>["render"]) => {
    EngineStore.UIComponents.set(id, { requirement, render });
  }
);

export const setPreviewEntity = action((entity: Entity | undefined) => {
  EngineStore.previewEntity = entity;
});

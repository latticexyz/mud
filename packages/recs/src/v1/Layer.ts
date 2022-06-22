import { Component, Schema, World } from "./types";

export type Layer = {
  world: World;
  components: Record<string, Component<Schema>>;
};

export type Layers = Record<string, Layer>;

import React from "react";
import { EngineStore } from "./store";
import { Layers } from "./types";

export const LayerContext = React.createContext<Layers>({} as Layers);
export const EngineContext = React.createContext<typeof EngineStore>(EngineStore);

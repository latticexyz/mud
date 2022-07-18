import React from "react";
import { Layers } from "../../../types";
import { EngineStore } from "./store";

export const LayerContext = React.createContext<Layers>({} as Layers);
export const EngineContext = React.createContext<typeof EngineStore>(EngineStore);

import React from "react";
import { Game } from "../../types";
import { EngineStore } from "./store";

export const LayerContext = React.createContext<Game>({} as Game);
export const EngineContext = React.createContext<typeof EngineStore>(EngineStore);

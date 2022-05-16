import { useContext } from "react";
import { EngineContext } from "../context";

export function useEngineStore() {
  return useContext(EngineContext);
}

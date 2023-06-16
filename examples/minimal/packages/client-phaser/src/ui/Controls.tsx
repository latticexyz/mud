import { useEffect } from "react";
import { useMUD, useStore } from "../store";
import { ClickWrapper } from "./theme/ClickWrapper";

export const Controls = () => {
  const { devMode } = useMUD();

  useEffect(() => {
    const sub = (e: KeyboardEvent) => {
      if (e.key === "`") {
        useStore.setState({ devMode: !devMode });
      }
    };

    document.addEventListener("keydown", sub);
    return () => {
      document.removeEventListener("keydown", sub);
    };
  }, [devMode]);

  return (
    <ClickWrapper style={{ position: "absolute", top: 0, left: 0, zIndex: 1000 }}>
      <button onClick={() => useStore.setState({ devMode: !devMode })}>
        {devMode ? "Hide" : "Show"} MUD Dev Console
      </button>
    </ClickWrapper>
  );
};

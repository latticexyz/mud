import React from "react";
import { useStore } from "../store";
import { Controls } from "./Controls";
import { ECSBrowser } from "./ECSBrowser";
import { LoadingScreen } from "./LoadingScreen";
import { Wrapper } from "./Wrapper";
import { Title } from "./Title";

export const UIRoot = () => {
  const layers = useStore((state) => {
    return {
      networkLayer: state.networkLayer,
      phaserLayer: state.phaserLayer,
    };
  });

  if (!layers.networkLayer || !layers.phaserLayer) return <></>;

  return (
    <Wrapper>
      <LoadingScreen />
      <ECSBrowser />
      <Controls />

      <Title/>
    </Wrapper>
  );
};

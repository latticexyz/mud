import { useComponentValue } from "@latticexyz/react";
import React from "react";
import { useMUD } from "../store";
import styled from "styled-components";

const TitleContainer = styled.div`
  position: absolute;
  top: 10%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
`;

export function Title() {
  const {
    networkLayer: {
      components: { CounterTable },
      singletonEntity,
    },
  } = useMUD();

  const counter = useComponentValue(CounterTable, singletonEntity);

  return (
    <TitleContainer>
      <h1>Soldier Clicker</h1>
      <h2>Click that soldier!</h2>
      <p>Level {counter?.value ?? 0}</p>
    </TitleContainer>
  );
}

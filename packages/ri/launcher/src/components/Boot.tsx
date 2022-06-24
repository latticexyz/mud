import { computed } from "mobx";
import { observer } from "mobx-react-lite";
import React from "react";
import styled from "styled-components";
import { useStore } from "../hooks";
export const Boot: React.FC = observer(() => {
  const store = useStore();

  const state = computed(() => {
    if (!store.personaId) {
      if (!store.wallet) return "Creating burner wallet...";
      return "Minting Persona...";
    }
    if (!store.burnerWallet) return "Authorizing burner wallet...";
    return "Let's go";
  });
  return <Container>{state.get()}</Container>;
});

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  font-family: "Space Mono", monospace;
  background-color: black;
  color: white;
  font-size: 100px;
  display: grid;
  align-items: center;
  justify-items: center;
`;

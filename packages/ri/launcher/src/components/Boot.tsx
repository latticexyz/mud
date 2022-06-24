import { computed } from "mobx";
import { observer } from "mobx-react-lite";
import React from "react";
import styled from "styled-components";
import { useStore } from "../hooks";
export const Boot: React.FC = observer(() => {
  const store = useStore();

  const state = computed(() => {
    if (!store.chainSpec || !store.gameSpec) return <>Loading config...</>;
    if (!store.personaId) {
      if (!store.wallet) return <>Creating burner wallet...</>;
      return (
        <>
          Minting <Red>Persona</Red>...
        </>
      );
    }
    if (!store.burnerWallet) return <>Authorizing burner wallet...</>;
    return <>Let's go</>;
  });
  return (
    <Container>
      <p>{state.get()}</p>
    </Container>
  );
});

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: black;
  display: grid;
  align-items: center;
  justify-items: center;

  p,
  span {
    font-family: "Space Mono", sans-serif;
    color: white;
    font-size: 100px;
  }
`;

const Red = styled.span`
  color: #eb4926 !important;
`;

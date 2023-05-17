import React from "react";
import styled from "styled-components";

const TitleContainer = styled.div`
  position: absolute;
  top: 10%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
`;

export function Title() {
  return (
    <TitleContainer>
      <h1>MUD 2D Game Template</h1>
    </TitleContainer>
  );
}

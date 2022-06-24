import React, { useState } from "react";
import styled from "styled-components";

export const Info: React.FC = ({ children }) => {
  const [open, setOpen] = useState(false);
  return (
    <Container>
      <Toggle onClick={() => setOpen((open) => !open)}>
        <p>{open ? <>&#10005;</> : <>&#9432;</>}</p>
      </Toggle>
      {open && <Content>{children}</Content>}
    </Container>
  );
};

const Container = styled.div`
  position: absolute;
  right: 5px;
  top: 5px;
`;
const Toggle = styled.div`
  text-align: right;
  user-select: none;
  p {
    border-radius: 5px;
    padding: 1px 4px 1px 4px;
    color: white;
    background-color: #1c1c20c7;
    cursor: pointer;
    display: inline-block;
  }
`;
const Content = styled.div`
  border-radius: 5px;
  color: white;
  background-color: #1c1c20c7;
  padding: 2px 4px 2px 4px;
  margin-top: 2px;
  p {
    font-size: 14px;
    font-family: "Space Mono", monospace;
    padding: 0;
    margin: 0;
  }
`;

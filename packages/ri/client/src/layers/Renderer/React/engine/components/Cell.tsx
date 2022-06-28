import React, { useEffect } from "react";
import styled from "styled-components";
import { observer } from "mobx-react-lite";
import { useLayers } from "../hooks";
import { filter, fromEvent } from "rxjs";

const WINDOW_CLASSNAME = "react-ui-window";

export const Cell: React.FC<{ style: React.CSSProperties }> = observer(({ children, style }) => {
  const {
    phaser: {
      scenes: {
        Main: { input },
      },
    },
  } = useLayers();

  useEffect(() => {
    // Enable input if pointer is not over window
    const sub = fromEvent(document, "mousemove")
      .pipe(
        filter(() => !input.enabled.current), // Only if input is currently disabled
        filter(() => document.querySelectorAll(`.${WINDOW_CLASSNAME}:hover`).length === 0) // Only if mouse is not over window
      )
      .subscribe(() => input.enableInput());

    return () => sub?.unsubscribe();
  }, []);

  return (
    <Container
      style={style}
      className={WINDOW_CLASSNAME}
      onMouseLeave={input.enableInput}
      onMouseEnter={input.disableInput}
    >
      {children}
    </Container>
  );
});

const Container = styled.div`
  width: 100%;
  height: 100%;
  pointer-events: all;
  color: #fff;
`;

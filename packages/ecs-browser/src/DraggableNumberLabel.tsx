import React from "react";
import { useCallback, useEffect, useState } from "react";
import { DraggableNumberLabelContainer } from "./StyledComponents";

export function DraggableNumberLabel({
  label,
  value,
  setValue,
  persistValue,
}: {
  label: string;
  value: number;
  setValue: (n: number) => void;
  persistValue: (e: Event | React.SyntheticEvent, value: string | null) => void;
}) {
  const [snapshot, setSnapshot] = useState(value);
  const [startMouseX, setStartMouseX] = useState(0);

  const onStart = useCallback(
    (event: React.MouseEvent) => {
      setStartMouseX(event.clientX);
      setSnapshot(value);
    },
    [value]
  );

  useEffect(() => {
    function onMouseMove(this: Document, event: MouseEvent) {
      if (startMouseX) {
        const change = Math.round((event.clientX - startMouseX) / 25) + snapshot;
        setValue(change);
      }
    }

    const onDragEnd = (e: Event) => {
      if (startMouseX) {
        setStartMouseX(0);
        persistValue(e, value.toString());
      }
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onDragEnd);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onDragEnd);
    };
  }, [startMouseX, setValue, snapshot, value]);

  return (
    <DraggableNumberLabelContainer
      onMouseDown={onStart}
    >
      {label}
    </DraggableNumberLabelContainer>
  );
}

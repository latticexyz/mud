import React, { useMemo } from "react";
import { useCallback, useEffect, useState } from "react";
import { DraggableNumberLabelContainer } from "./StyledComponents";

export function DraggableNumberLabel({
  label,
  value,
  setValue,
  persistValue,
}: {
  label: string;
  value: string | null;
  setValue: (n: string | null) => void;
  persistValue: (e: Event | React.SyntheticEvent, value: string | null) => void;
}) {
  const numberValue = useMemo(() => parseInt(value ?? "0"), [value]);
  const [snapshot, setSnapshot] = useState(numberValue);
  const [startMouseX, setStartMouseX] = useState(0);

  const onStart = useCallback(
    (event: React.MouseEvent) => {
      setStartMouseX(event.clientX);
      setSnapshot(numberValue);
    },
    [numberValue]
  );

  useEffect(() => {
    function onMouseMove(this: Document, event: MouseEvent) {
      if (startMouseX) {
        const change = Math.round((event.clientX - startMouseX) / 25) + snapshot;
        setValue(change.toString());
      }
    }

    const onDragEnd = (e: Event) => {
      if (startMouseX) {
        setStartMouseX(0);
        persistValue(e, value?.toString() || null);
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

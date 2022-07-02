import { Component, Type } from "@latticexyz/recs";
import { useComponentValueStream } from "@latticexyz/std-client";
import React, { useEffect, useState } from "react";
import { ComponentBrowserButton } from "../StyledComponents";

export const PositionFilterButton: React.FC<{
  editQuery: (queryText: string) => void;
  queryInputRef: React.RefObject<HTMLInputElement>;
  hoverHighlightComponent: Component<{ x: Type.OptionalNumber; y: Type.OptionalNumber }>;
}> = ({ hoverHighlightComponent, editQuery, queryInputRef }) => {
  const [selectingPosition, setSelectingPosition] = useState(false);
  const hoverPosition = useComponentValueStream(hoverHighlightComponent);

  useEffect(() => {
    if (!selectingPosition) return;

    function onMouseDown() {
      if (!hoverPosition) return;

      setSelectingPosition(false);
      editQuery(`[HasValue(LocalPosition, { x: ${hoverPosition.x}, y: ${hoverPosition.y} })]`);
      queryInputRef.current?.focus();
    }

    document.addEventListener("mousedown", onMouseDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, [selectingPosition, hoverPosition]);

  return (
    <ComponentBrowserButton
      style={{ margin: "8px auto" }}
      active={selectingPosition}
      onClick={() => {
        setSelectingPosition(true);
      }}
    >
      {selectingPosition
        ? `[HasValue(LocalPosition, { x: ${hoverPosition?.x}, y: ${hoverPosition?.y} })]`
        : "Select Entities at a position"}
    </ComponentBrowserButton>
  );
};

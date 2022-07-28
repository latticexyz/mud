import { Component, Type } from "@latticexyz/recs";
import React, { useEffect, useState } from "react";
import { ComponentBrowserButton } from "../StyledComponents";
import { pixelCoordToTileCoord } from "@latticexyz/phaserx";

export const PositionFilterButton: React.FC<{
  editQuery: (queryText: string) => void;
  queryInputRef: React.RefObject<HTMLInputElement>;
  hoverHighlightComponent: Component<{ x: Type.OptionalNumber; y: Type.OptionalNumber }>;
  input: any;
}> = ({ editQuery, queryInputRef, input }) => {
  const [selectingPosition, setSelectingPosition] = useState(false);

  useEffect(() => {
    if (!selectingPosition) return;

    function onMouseDown() {
      if (!input) return;
      const pointer = input.activePointer;
      const pos = { x: pointer.worldX, y: pointer.worldY };
      const worldCoord = pixelCoordToTileCoord(pos, 16, 16);
      setSelectingPosition(false);
      editQuery(`[HasValue(Position, { x: ${worldCoord.x}, y: ${worldCoord.y} })]`);
      queryInputRef.current?.focus();
    }

    document.addEventListener("mousedown", onMouseDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, [selectingPosition]);

  return (
    <ComponentBrowserButton
      style={{ margin: "8px auto" }}
      active={selectingPosition}
      onClick={() => {
        setSelectingPosition(true);
      }}
    >
      {selectingPosition ? `Click on tile to select position` : "Select Entities at a position"}
    </ComponentBrowserButton>
  );
};

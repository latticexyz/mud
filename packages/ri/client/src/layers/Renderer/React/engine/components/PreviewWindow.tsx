import React from "react";
import { ComponentRenderer } from "./ComponentRenderer";
import { Window } from "./Window";
import { useEngineStore } from "../hooks";
import { observer } from "mobx-react-lite";

export const PreviewWindow: React.FC = observer(() => {
  const { previewEntity } = useEngineStore();
  return previewEntity ? (
    <Window>
      <ComponentRenderer selectedEntities={new Set([previewEntity])} />
    </Window>
  ) : null;
});

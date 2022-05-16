import React from "react";
import { observer } from "mobx-react-lite";
import { useSelectedEntities } from "../hooks";
import { ComponentRenderer } from "./ComponentRenderer";
import { Window } from "./Window";

export const MainWindow: React.FC = observer(() => {
  const selectedEntities = useSelectedEntities();
  return (
    <Window>
      <ComponentRenderer selectedEntities={selectedEntities} />
    </Window>
  );
});

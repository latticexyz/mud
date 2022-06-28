import React from "react";
import { observer } from "mobx-react-lite";
import { useSelectedEntities } from "../hooks";
import { ComponentRenderer } from "./ComponentRenderer";

export const MainWindow: React.FC = observer(() => {
  const selectedEntities = useSelectedEntities();
  return <ComponentRenderer selectedEntities={selectedEntities} />;
});

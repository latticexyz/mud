import React from "react";
import { observer } from "mobx-react-lite";
import { ComponentRenderer } from "./ComponentRenderer";

export const MainWindow: React.FC = observer(() => {
  return <ComponentRenderer />;
});

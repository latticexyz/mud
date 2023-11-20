import { createMemoryRouter, createRoutesFromElements, Route } from "react-router-dom";
import { RootPage } from "./RootPage";
import { RouteError } from "./RouteError";
import { EventsPage } from "./events/EventsPage";
import { SummaryPage } from "./summary/SummaryPage";
import { ActionsPage } from "./actions/ActionsPage";
import { ComponentsPage } from "./recs/ComponentsPage";
import { ComponentData } from "./recs/ComponentData";
import { TablesPage } from "./zustand/TablesPage";
import { TableData } from "./zustand/TableData";

export const router = createMemoryRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootPage />} errorElement={<RouteError />}>
      <Route index element={<SummaryPage />} />
      <Route path="actions" element={<ActionsPage />} />
      <Route path="events" element={<EventsPage />} />
      <Route path="tables" element={<TablesPage />}>
        <Route path=":id" element={<TableData />} />
      </Route>
      <Route path="components" element={<ComponentsPage />}>
        <Route path=":id" element={<ComponentData />} />
      </Route>
    </Route>
  )
);

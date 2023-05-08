import { createMemoryRouter, createRoutesFromElements, Route } from "react-router-dom";
import { RootPage } from "./RootPage";
import { EventsPage } from "./events/EventsPage";
import { SummaryPage } from "./summary/SummaryPage";
import { ActionsPage } from "./actions/ActionsPage";
import { TablesPage } from "./tables/TablesPage";
import { Table } from "./tables/Table";
import { RouteError } from "./RouteError";

export const router = createMemoryRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootPage />} errorElement={<RouteError />}>
      <Route index element={<SummaryPage />} />
      <Route path="actions" element={<ActionsPage />} />
      <Route path="events" element={<EventsPage />} />
      <Route path="tables" element={<TablesPage />}>
        <Route path=":table" element={<Table />} />
      </Route>
    </Route>
  )
);

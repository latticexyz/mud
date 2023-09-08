import { createMemoryRouter, createRoutesFromElements, Route } from "react-router-dom";
import { ActionsPage } from "./actions/ActionsPage";
import { RouteOptions } from "./common";
import { EventsPage } from "./events/EventsPage";
import { ComponentData } from "./recs/ComponentData";
import { ComponentsPage } from "./recs/ComponentsPage";
import { RootPage } from "./RootPage";
import { RouteError } from "./RouteError";
import { SummaryPage } from "./summary/SummaryPage";

export const createRouter = (settings: RouteOptions) =>
  createMemoryRouter(
    createRoutesFromElements(
      <Route path="/" element={<RootPage />} errorElement={<RouteError />}>
        <Route index element={<SummaryPage />} />
        <Route path="actions" element={<ActionsPage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="components" element={<ComponentsPage />}>
          <Route path=":id" element={<ComponentData />} />
        </Route>
        {settings.tabs?.map((tab, i) => (
          <Route key={tab.path + i} path={tab.path} element={tab.element} />
        ))}
      </Route>
    )
  );

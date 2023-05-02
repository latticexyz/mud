import { createMemoryRouter, createRoutesFromElements, Route, Navigate } from "react-router-dom";
import { App } from "./App";
import { StoreLogPage } from "./store-log/StoreLogPage";
import { SummaryPage } from "./summary/SummaryPage";
import { ActionsPage } from "./actions/ActionsPage";

export const router = createMemoryRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index element={<SummaryPage />} />
      <Route path="/actions" element={<ActionsPage />} />
      <Route path="/store-log" element={<StoreLogPage />} />
      <Route path="/store-data" element={<>TODO</>} />
    </Route>
  )
);

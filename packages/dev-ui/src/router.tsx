import { createMemoryRouter, createRoutesFromElements, Route, Navigate } from "react-router-dom";
import { App } from "./App";
import { StoreLogPage } from "./store-log/StoreLogPage";
import { Summary } from "./summary/Summary";

export const router = createMemoryRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index element={<Summary />} />
      <Route path="/actions" element={<>TODO</>} />
      <Route path="/store-log" element={<StoreLogPage />} />
      <Route path="/store-data" element={<>TODO</>} />
    </Route>
  )
);

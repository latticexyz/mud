import { createMemoryRouter, createRoutesFromElements, Route, Navigate } from "react-router-dom";
import { App } from "./App";
import { StoreEvents } from "./StoreEvents";

export const router = createMemoryRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index element={<>TODO</>} />
      <Route path="/actions" element={<>TODO</>} />
      <Route path="/store-log" element={<StoreEvents />} />
      <Route path="/store-data" element={<>TODO</>} />
    </Route>
  )
);

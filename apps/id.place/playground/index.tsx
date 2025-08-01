import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Playground } from "./Playground";

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.querySelector("#react-root")!);
root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Playground />
    </QueryClientProvider>
  </StrictMode>,
);

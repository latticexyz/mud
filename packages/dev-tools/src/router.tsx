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

/*
This workaround is necessary to pass `tsc --declaration`. Without it, the following error occurs:

```
error TS2742: The inferred type of 'router' cannot be named without a reference to '.pnpm/@remix-run+router@1.6.0/node_modules/@remix-run/router'.
This is likely not portable. A type annotation is necessary.
```

This `tsc --declaration` issue arises under the following combined conditions:

1. pnpm is the package manager.
2. The source uses a function from the dependency package (this time, react-router-dom's createMemoryRouter) and relies on type inference for its return type.
3. The inferred return type originates from a package that is not a direct dependency of the source (this time, @remix-run/router's Router).
4. The dependency package containing the function (react-router-dom) does not re-export the function's return type (Router).

See https://github.com/microsoft/TypeScript/issues/47663#issuecomment-1519138189
*/
type Router = ReturnType<typeof createMemoryRouter>;

export const router: Router = createMemoryRouter(
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

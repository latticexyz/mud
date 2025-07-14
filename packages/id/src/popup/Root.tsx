// import { messenger } from "./messenger";
import { porto } from "./porto";
import { onDialogRequest } from "porto/remote/Events";
import { RouterProvider } from "react-router";
import { router } from "./router";

const offDialogRequest = onDialogRequest(porto, ({ account, request, requireUpdatedAccount }) => {
  const connectedAccount = porto._internal.store.getState().accounts[0];
  // const needsSync = account && account.address !== connectedAccount?.address;

  // if (needsSync)
  //   Actions.connect(Wagmi.config, {
  //     address: account.address,
  //     connector: getConnectors(Wagmi.config)[0]!,
  //     credentialId: account.credentialId,
  //     force: true,
  //   });
  if (request) {
    router.navigate(`/request/${request.method}`, {
      state: { request },
      replace: true,
    });
  }
});

porto.ready();

if (import.meta.hot) {
  import.meta.hot.on("vite:beforeUpdate", () => {
    // offInitialized();
    offDialogRequest();
  });
}

export function Root() {
  return <RouterProvider router={router} />;
}

import * as Actions from "porto/remote/Actions";
import { useLocation } from "react-router";
import { porto } from "../../../src/popup/porto";
import { LoginContainer } from "../../../src/ui/LoginContainer";

export function Connect() {
  const location = useLocation();
  // TODO: abstract this to get a typed request
  const searchParams = new URLSearchParams(location.search);
  const request = JSON.parse(searchParams.get("request")!);

  // TODO: reorder buttons based on whether we have accounts cached
  // TODO: figure out how to avoid double prompt on sign in when you decline the first
  // TODO: move to react-query so we can get pending indicators

  return (
    <>
      <LoginContainer
        createAccount={async () => {
          try {
            await Actions.respond(porto, {
              ...request,
              params: [
                {
                  ...request.params[0],
                  capabilities: {
                    ...request.params[0].capabilities,
                    createAccount: true,
                  },
                },
              ],
            });
          } catch (error) {
            // TODO: improve this
            Actions.reject(porto, request);
          }
        }}
        signIn={async () => {
          try {
            await Actions.respond(porto, request);
          } catch (error) {
            // TODO: improve this
            Actions.reject(porto, request);
          }
        }}
      />
    </>
  );
}

import * as Actions from "porto/remote/Actions";
import { useLocation } from "react-router";
import { porto } from "../../../src/popup/porto";

export function Connect() {
  const location = useLocation();
  // TODO: abstract this to get a typed request
  const { request } = location.state;

  return (
    <div style={{ display: "flex", gap: "0.5em" }}>
      <button
        type="button"
        onClick={async () => {
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
      >
        create
      </button>
      <button
        // ref={(el) => {
        //   el?.click();
        // }}
        type="button"
        onClick={async () => {
          try {
            await Actions.respond(porto, request);
          } catch (error) {
            // TODO: improve this
            Actions.reject(porto, request);
          }
        }}
      >
        sign
      </button>
    </div>
  );
}

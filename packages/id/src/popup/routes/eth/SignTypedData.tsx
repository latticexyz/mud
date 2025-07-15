import * as Actions from "porto/remote/Actions";
import { useLocation } from "react-router";
import { porto } from "../../porto";

export function SignTypedData() {
  const location = useLocation();
  // TODO: abstract this to get a typed request
  const { request } = location.state;

  return (
    <div>
      <button type="button" onClick={() => Actions.respond(porto, request).catch(() => Actions.reject(porto, request))}>
        approve
      </button>
    </div>
  );
}

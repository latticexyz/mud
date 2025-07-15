import { Actions } from "porto/remote";
import { useLocation } from "react-router";
import { porto } from "../porto";

export function NotFound() {
  const location = useLocation();
  // TODO: abstract this to get a typed request
  const { request } = location.state ?? {};

  return (
    <div>
      <h1>Not found</h1>
      {request ? (
        <div>
          <dl>
            <dt>method</dt>
            <dd>
              <pre>{request.method}</pre>
            </dd>
            <dt>params</dt>
            <dd>
              <pre>{JSON.stringify(request.params, null, 2)}</pre>
            </dd>
          </dl>
          <button
            type="button"
            onClick={() => Actions.respond(porto, request).catch(() => Actions.reject(porto, request))}
          >
            submit
          </button>
        </div>
      ) : null}
    </div>
  );
}

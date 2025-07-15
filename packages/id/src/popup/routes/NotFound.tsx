import { useLocation } from "react-router";

export function NotFound() {
  const location = useLocation();
  // TODO: abstract this to get a typed request
  const { request } = location.state ?? {};

  return (
    <div>
      <h1>Not found</h1>
      {request ? (
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
      ) : null}
    </div>
  );
}

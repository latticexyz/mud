import * as Actions from "porto/remote/Actions";
import { useLocation } from "react-router";
import { porto } from "../../../src/popup/porto";
import { useEffect } from "react";

export function SendCalls() {
  const location = useLocation();
  // TODO: abstract this to get a typed request
  const searchParams = new URLSearchParams(location.search);
  const request = JSON.parse(searchParams.get("request")!);

  // TODO: clean this up with react-query to show pending state etc.
  useEffect(() => {
    const id = setTimeout(() => {
      Actions.respond(porto, request).catch(() => Actions.reject(porto, request));
    }, 600);
    return () => clearTimeout(id);
  }, []);

  return (
    <div>
      <button type="button" onClick={() => Actions.respond(porto, request).catch(() => Actions.reject(porto, request))}>
        approve
      </button>
    </div>
  );
}

import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";

export function Docs() {
  const location = useLocation();
  const path = useMemo(() => {
    return location.pathname.replace("/docs/", "");
  }, [location]);
  return <IFrame src={`https://docs.mud.dev/${path}`}></IFrame>;
}

const IFrame = styled.iframe`
  height: 100%;
  width: 100%;
  border: none;
`;

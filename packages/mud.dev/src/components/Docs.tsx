import { useParams } from "react-router-dom";
import styled from "styled-components";

export function Docs() {
  const { packageName } = useParams();
  return <IFrame src={`https://mud.dev/${packageName}`}></IFrame>;
}

const IFrame = styled.iframe`
  height: 100%;
  width: 100%;
  border: none;
`;

import { type } from "arktype";
import packageJson from "../../package.json";

export const version = packageJson.version;

export const initialMessageShape = type({
  mudId: "string", // version
  "context?": "unknown",
});

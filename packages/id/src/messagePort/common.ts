import { type } from "arktype";
import packageJson from "../../package.json";
import { rp } from "../rp/common";

export const version = packageJson.version;

export const initialMessageShape = type({
  "@": `'${rp.id}'` as const,
  version: "string",
  id: "string",
  "context?": "unknown",
});

export const initialMessage = {
  "@": rp.id,
  version,
} as const satisfies Pick<typeof initialMessageShape.infer, "@" | "version">;

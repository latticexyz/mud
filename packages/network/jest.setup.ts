import { TextEncoder } from "util";

// TextEncoder APIs are used by viem, but are not provided by
// jsdom, all node versions supported provide these via the util module
if (typeof globalThis.TextEncoder === "undefined") {
  globalThis.TextEncoder = TextEncoder;
}

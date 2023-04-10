declare module "prettier-plugin-solidity";
// adding .js to minimal would break clients down the line because it probably won't get a synthetic default import
/* eslint-disable @typescript-eslint/no-explicit-any */
declare module "protobufjs/minimal" {
  export const configure: any;
  export const util: any;
  export const Reader: any;
  export type Reader = any;
  export const Writer: any;
  export type Writer = any;
}

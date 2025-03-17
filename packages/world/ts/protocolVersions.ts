// History of protocol versions and a short description of what changed in each.
export const protocolVersions = {
  "2.1.0":
    "Added `callWithSignature` to allow calling functions on behalf of another address by providing a signature.",
  "2.0.2":
    "Patched `StoreCore.registerTable` to prevent registering both an offchain and onchain table with the same name.",
  "2.0.1": "Patched `StoreRead.getDynamicFieldLength` to use the correct method to read the dynamic field length.",
  "2.0.0": "Initial v2 release. See mud.dev/changelog for the full list of changes from v1.",
};

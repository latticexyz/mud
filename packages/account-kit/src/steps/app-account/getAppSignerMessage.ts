export function getAppSignerMessage(origin: string, account: number = 0) {
  // BE CAREFUL MODIFYING THIS MESSAGE!
  //
  // Once modified, all prior accounts will not be easily retrievable.
  return [
    `${origin} is requesting proof of ownership of this address.`,
    "",
    `Only sign this message if it came from an app you are interacting with at ${origin}.`,
    "",
    "A private key will be derived from this message signature and be used to transact on your behalf within this app. Do not share this message signature with anyone else.",
    "",
    "",
    // We append a message version (to recover accounts from older messages)
    // and an optional account ID (to create more than one account per origin)
    `version=1 account=${account}`,
  ].join("\n");
}

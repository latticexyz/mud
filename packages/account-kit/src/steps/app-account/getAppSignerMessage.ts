export function getAppSignerMessage(origin: string, appAccountNonce: number = 0) {
  // BE CAREFUL MODIFYING THIS MESSAGE!
  //
  // Once modified, all prior accounts will not be easily retrievable.
  return [
    `${origin} is requesting proof of ownership of your connected account.`,
    "",
    `Only sign this message if it came from an app you are interacting with at ${origin}.`,
    "",
    "A private key will be derived from this message signature and be used to transact on your behalf within this app. Do not share this message signature with anyone else.",
    "",
    "",
    // We append a message version (to recover accounts from older messages)
    // and an optional app account nonce (to create more than one app account per origin)
    `version=1 account=${appAccountNonce}`,
  ].join("\n");
}

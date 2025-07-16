# TODO

## Flows

- Create account (lazy, no account is actually created here)

  - Generate bootstrapping EOA
  - Compute smart account address using EOA owner
  - Create passkey using smart account address as the credential's user ID
  - Cache pending bootstrap request
  - Return account

- Load account

  - Sign with a passkey
  - Get smart account address from credential of selected passkey signature
  - If account has pending bootstrap request, return account
  - Otherwise look up owners of smart account and find an owner public key that matches credential public key of selected passkey, return account

- Send calls

  - Prepare calls as user op request
  - Sign user op request with passkey
  - If there are pending bootstrap requests, send as user ops + wait for receipts
  - Send user op request

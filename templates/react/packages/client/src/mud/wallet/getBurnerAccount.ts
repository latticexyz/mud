import { getBurnerPrivateKey, createBurnerAccount } from "@latticexyz/common";

// Get or create a burner account.
//
// A burner account is a temporary account stored in local storage.
// This function checks its existence in storage; if absent, generates and saves the account.
export function getBurnerAccount() {
  return createBurnerAccount(getBurnerPrivateKey());
}

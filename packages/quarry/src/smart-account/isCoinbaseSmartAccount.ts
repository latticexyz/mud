import { Account } from "viem";
import { ToCoinbaseSmartAccountReturnType } from "./toCoinbaseSmartAccount";

export function isCoinbaseSmartAccount(account: Account | undefined): account is ToCoinbaseSmartAccountReturnType {
  return account != null && "__isCoinbaseSmartAccount" in account && account.__isCoinbaseSmartAccount === true;
}

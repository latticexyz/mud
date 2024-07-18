import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PRIVATE_KEYS } from "@/consts";
import { privateKeyToAccount } from "viem/accounts";

export function AccountSelect() {
  return (
    <Select defaultValue={privateKeyToAccount(PRIVATE_KEYS[0]).address}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Account" />
      </SelectTrigger>
      <SelectContent>
        {PRIVATE_KEYS.map((key, idx) => {
          const { address } = privateKeyToAccount(key);
          return (
            <SelectItem key={address} value={address}>
              Account {idx + 1}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

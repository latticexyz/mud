import { formatEther } from "viem";
import { AccountModalSection } from "../../../AccountModalSection";
import { useAccount, useBalance } from "wagmi";
import { useConfig } from "../../../AccountKitProvider";

export function BalancesFees({ fees }: { fees: string }) {
  const { chain } = useConfig();
  const userAccount = useAccount();
  const userAccountAddress = userAccount.address;
  const userBalance = useBalance({
    chainId: chain.id,
    address: userAccountAddress,
  });

  return (
    <AccountModalSection>
      <div className="flex flex-col gap-2">
        <ul>
          <li className="flex justify-between py-[8px] border-b border-black border-opacity-10">
            <span className="opacity-50">Available to deposit</span>
            <span className="font-medium">
              {userBalance?.data?.value
                ? parseFloat(formatEther(userBalance?.data?.value)).toLocaleString("en", {
                    minimumFractionDigits: 5,
                  })
                : "..."}{" "}
              ETH <span className="text-neutral-800">($3,605.21)</span>
            </span>
          </li>
          <li className="flex justify-between py-[8px] border-b border-black border-opacity-10">
            <span className="opacity-50">Estimated fee</span>
            <span className="font-medium">
              {fees || "..."} ETH <span className="text-neutral-800">($3.40)</span>
            </span>
          </li>
          <li className="flex justify-between py-[8px]">
            <span className="opacity-50">Transfer time</span>
            <span className="font-medium">~5 seconds</span>
          </li>
        </ul>
      </div>
    </AccountModalSection>
  );
}

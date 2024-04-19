import { formatEther } from "viem";
import { AccountModalSection } from "../../../AccountModalSection";
import { useAccount, useBalance } from "wagmi";
import { DepositMethod } from "../DepositContent";
import { useTransactionFees } from "../hooks/useTransactionFees";

type Props = {
  amount: number | undefined;
  depositMethod: DepositMethod;
};

export function BalancesFees({ amount, depositMethod }: Props) {
  const userAccount = useAccount();
  const userAccountAddress = userAccount.address;
  const userAccountChainId = userAccount?.chain?.id;
  const userBalance = useBalance({
    chainId: userAccountChainId,
    address: userAccountAddress,
  });
  const { fees, transferTime } = useTransactionFees(amount, depositMethod);

  return (
    <AccountModalSection>
      <div className="flex flex-col gap-2 mt-[6px]">
        <ul>
          <li className="flex justify-between py-[8px] border-b border-black border-opacity-10 dark:border-white dark:border-opacity-10">
            <span className="font-medium opacity-50 dark:text-white">Available to deposit</span>
            <span className="font-medium">
              {userBalance?.data?.value
                ? parseFloat(formatEther(userBalance?.data?.value)).toLocaleString("en", {
                    minimumFractionDigits: 5,
                  })
                : "..."}{" "}
              ETH <span className="text-neutral-800 dark:text-neutral-400">($3,605.21)</span>
            </span>
          </li>

          <li className="flex justify-between py-[8px] border-b border-black border-opacity-10 dark:border-white dark:border-opacity-10">
            <span className="font-medium opacity-50 dark:text-white">Estimated fee</span>
            <span className="font-medium">
              {fees
                ? parseFloat(fees).toLocaleString("en", {
                    minimumFractionDigits: 5,
                  })
                : "..."}{" "}
              ETH <span className="text-neutral-800 dark:text-neutral-400">($3.40)</span>
            </span>
          </li>

          <li className="flex justify-between py-[8px]">
            <span className="font-medium opacity-50 dark:text-white">Transfer time</span>
            <span className="font-medium">~{transferTime} seconds</span>
          </li>
        </ul>
      </div>
    </AccountModalSection>
  );
}

import { Hex } from "viem";
import { useENS } from "./useENS";
import { Logo } from "./icons/Logo";
import { TruncatedHex } from "./ui/TruncatedHex";
import { usePreloadImage } from "./usePreloadImage";
import { twMerge } from "tailwind-merge";

export type Props = {
  address: Hex | undefined;
};

export function AccountName({ address }: Props) {
  const { data: ens } = useENS(address);
  const { isSuccess: hasAvatar } = usePreloadImage(ens.avatar);

  return (
    <>
      <span className="flex-shrink-0 w-6 h-6 -my-1 -mx-0.5 grid place-items-center">
        <img
          src={hasAvatar ? ens.avatar : undefined}
          className={twMerge(
            "col-start-1 row-start-1",
            "inline-flex w-full h-full rounded-full bg-black/10 dark:bg-white/10 bg-cover bg-no-repeat bg-center",
            hasAvatar ? "opacity-100" : "opacity-0",
          )}
        />
        <Logo
          className={twMerge(
            "col-start-1 row-start-1 text-orange-500",
            "transition duration-300",
            hasAvatar ? "opacity-0" : "opacity-100",
          )}
        />
      </span>
      <span className="flex-grow">{ens.name ?? (address ? <TruncatedHex hex={address} /> : null)}</span>
    </>
  );
}

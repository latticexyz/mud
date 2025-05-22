import { StaticImport } from "next/dist/shared/lib/get-img-props";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { anvil } from "viem/chains";
import { useEnv } from "../app/(explorer)/providers/EnvProvider";
import anvilLogo from "../assets/logos/anvil.svg";
import garnetLogo from "../assets/logos/garnet.svg";
import pyropeLogo from "../assets/logos/pyrope.svg";
import redstoneLogo from "../assets/logos/redstone.svg";
import { supportedChains } from "../common";
import { capitalize, cn } from "../utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/Select";

const chainLogos: Record<string, StaticImport> = {
  anvil: anvilLogo,
  garnet: garnetLogo,
  pyrope: pyropeLogo,
  redstone: redstoneLogo,
};

type Props = {
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
};

export function ChainSwitch({ className, size = "default" }: Props) {
  const router = useRouter();
  const { chainName } = useParams();
  const env = useEnv();
  const chainId = Number(env.CHAIN_ID);

  const onChainChange = (chainName: string) => {
    router.push(`/${chainName}/worlds`);
  };

  return (
    <Select value={chainName as string} onValueChange={onChainChange}>
      <SelectTrigger className={cn("w-auto", className)} size={size}>
        <SelectValue placeholder="Select chain" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(supportedChains)
          .filter(([, chain]) => (chainId === anvil.id ? true : chain.id !== anvil.id))
          .map(([name, chain]) => (
            <SelectItem key={name} value={name}>
              <div className="flex items-center gap-x-2 pr-2">
                {chainLogos[name] && (
                  <Image src={chainLogos[name] as StaticImport} alt={chain.name} width={24} height={24} />
                )}
                {chain.id === anvil.id ? "Local" : capitalize(name)}
              </div>
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
}

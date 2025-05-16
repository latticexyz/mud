import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { anvil } from "viem/chains";
import { supportedChains } from "../common";
import { capitalize } from "../utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/Select";

type Props = {
  size?: "default" | "sm" | "lg" | "icon";
};

export function ChainSwitch({ size = "default" }: Props) {
  const router = useRouter();
  const { chainName } = useParams();

  const onChainChange = (chainName: string) => {
    router.push(`/${chainName}/worlds`);
  };

  return (
    <Select value={chainName as string} onValueChange={onChainChange}>
      <SelectTrigger className="w-auto" size={size}>
        <SelectValue placeholder="Select chain" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(supportedChains).map(([name, chain]) => (
          <SelectItem key={name} value={name}>
            <div className="flex items-center gap-x-2 pr-2">
              <Image src={`/logos/${name}.svg`} alt={chain.name} width={24} height={24} />
              {chain.id === anvil.id ? "Local" : capitalize(name)}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

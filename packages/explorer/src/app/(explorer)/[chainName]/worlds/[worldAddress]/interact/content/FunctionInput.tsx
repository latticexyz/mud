import { toast } from "sonner";
import { AbiParameter, isAddress } from "viem";
import { useCallback, useState } from "react";
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../../../../../../components/ui/Form";
import { Input } from "../../../../../../../components/ui/Input";

type Props = {
  input: AbiParameter;
  index: number;
};

const getInputPlaceholder = (input: AbiParameter): string => {
  if (!("components" in input)) {
    return input.type;
  }

  const componentsString = input.components.map((c) => c.name || c.type).join(", ");
  if (input.type === "tuple[]") {
    return `[${componentsString}][]`;
  }
  return `[${componentsString}]`;
};

export function FunctionInput({ input, index }: Props) {
  const [isResolving, setIsResolving] = useState(false);
  const form = useFormContext();

  const handleChange = useCallback(
    async (value: string) => {
      // If it's not an address type or already a valid address, just update the value
      if (input.type !== "address" || isAddress(value)) {
        form.setValue(`inputs.${index}`, value);
        return;
      }

      // Try to resolve ENS
      setIsResolving(true);
      try {
        const response = await fetch(`https://api.ensideas.com/ens/resolve/${value}`);
        const data = await response.json();

        if (data.address) {
          form.setValue(`inputs.${index}`, data.address);
        } else {
          form.setValue(`inputs.${index}`, value);
          toast.error(`Could not resolve ENS name: ${value}`);
        }
      } catch (error) {
        form.setValue(`inputs.${index}`, value);
        toast.error(`Failed to resolve ENS name: ${value}`);
      } finally {
        setIsResolving(false);
      }
    },
    [form, index, input.type],
  );

  return (
    <FormField
      control={form.control}
      name={`inputs.${index}`}
      render={({ field }) => (
        <FormItem className="flex items-center gap-4 space-y-0">
          {input.name && <FormLabel className="shrink-0 pt-1 font-mono text-sm opacity-70">{input.name}</FormLabel>}
          <div className="flex-1">
            <FormControl>
              <Input
                placeholder={getInputPlaceholder(input)}
                value={field.value}
                onChange={(evt) => handleChange(evt.target.value)}
                className="font-mono text-sm"
                disabled={isResolving}
              />
            </FormControl>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
}

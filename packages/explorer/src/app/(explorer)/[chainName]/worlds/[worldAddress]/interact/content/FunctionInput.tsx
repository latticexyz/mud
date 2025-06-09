import { CheckIcon, LoaderIcon } from "lucide-react";
import { AbiParameter, isAddress } from "viem";
import { useCallback, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../../../../../../components/ui/Form";
import { Input } from "../../../../../../../components/ui/Input";
import { useEnsAddress } from "./useEnsAddress";

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
  const form = useFormContext();
  const currentValue = form.watch(`inputs.${index}`);
  const resolvedAddress = form.watch(`resolvedAddresses.${index}`);
  const { data: ensAddress, isLoading: isEnsAddressLoading, error: ensAddressError } = useEnsAddress(currentValue);

  useEffect(() => {
    if (ensAddress !== resolvedAddress) {
      form.setValue(`resolvedAddresses.${index}`, ensAddress);
    }
  }, [ensAddress, resolvedAddress, form, index]);

  const handleChange = useCallback(
    async (value: string) => {
      if (input.type !== "address") {
        form.setValue(`inputs.${index}`, value);
        return;
      }

      if (isAddress(value)) {
        form.setValue(`inputs.${index}`, value);
        form.setValue(`resolvedAddresses.${index}`, value);
        return;
      }

      form.setValue(`inputs.${index}`, value);
      form.setValue(`resolvedAddresses.${index}`, undefined);
    },
    [form, index, input.type],
  );

  return (
    <FormField
      control={form.control}
      name={`inputs.${index}`}
      render={({ field }) => (
        <FormItem className="flex flex-col gap-2">
          <div className="flex items-start gap-4">
            {input.name && <FormLabel className="shrink-0 pt-2 font-mono text-sm opacity-70">{input.name}</FormLabel>}
            <div className="flex-1">
              <FormControl>
                <Input
                  placeholder={getInputPlaceholder(input)}
                  value={field.value}
                  onChange={(evt) => handleChange(evt.target.value)}
                  className="font-mono text-sm"
                />
              </FormControl>
              <FormMessage />

              {input.type === "address" && !isAddress(currentValue) && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {isEnsAddressLoading && (
                    <>
                      <LoaderIcon className="h-3 w-3 animate-spin" />
                      <span>Resolving ENS name...</span>
                    </>
                  )}
                  {ensAddressError && <span className="text-destructive">Failed to resolve ENS</span>}
                  {resolvedAddress && !isEnsAddressLoading && (
                    <span className="flex items-center gap-1 font-mono">
                      {resolvedAddress} <CheckIcon className="h-4 w-4 text-green-500" />
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </FormItem>
      )}
    />
  );
}

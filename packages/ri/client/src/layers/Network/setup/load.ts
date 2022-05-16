import { BaseProvider } from "@ethersproject/providers";

export function load(provider: BaseProvider) {
  provider.resetEventsBlock(0);
}

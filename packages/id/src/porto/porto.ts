import { Porto } from "porto";
import { porto } from "porto/wagmi";
import { Connector } from "wagmi";
// import { mode } from "./mode";
// import { anvil } from "wagmi/chains";

// TODO: disable announce so we can do it ourselves with our own name/icon: https://github.com/ithacaxyz/porto/blob/fefb71a71b631fbcc4d50581c0708944c3e8e5df/src/core/internal/provider.ts#L1074-L1085

// export const porto = Porto.create({
//   mode,
//   chains: [anvil],
// });

export { Porto, porto };

export type PortoConnector = Connector<ReturnType<typeof porto>>;

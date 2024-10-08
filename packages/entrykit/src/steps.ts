import { AccountRequirement } from "./useAccountRequirements";

export type StepId =
  | "connectWallet"
  | "fundWallet"
  | "createAppAccount"
  | "delegateAppAccount"
  | "fundAppAccount"
  | "finalize";

export type Step = {
  readonly label: string;
  readonly requires: readonly AccountRequirement[];
  readonly satisfies: readonly AccountRequirement[];
};

export type Steps = {
  readonly [key in StepId]?: Step;
};

export const initialSteps = {
  connectWallet: {
    label: "Sign in",
    requires: [],
    satisfies: ["walletConnected"],
  },
} as const satisfies Steps;

export const passkeySteps = {
  ...initialSteps,
  fundWallet: {
    label: "Top up", // other ideas: "Add funds", "Claim gas pass"
    requires: ["walletConnected"],
    satisfies: ["walletFunded"],
  },
  createAppAccount: {
    label: "Create account",
    requires: ["walletConnected"],
    satisfies: ["appSigner"],
  },
  delegateAppAccount: {
    label: "Set up account",
    requires: ["appSigner", "walletFunded"],
    satisfies: ["appAccountDelegationPrepared", "appAccountDelegation"],
  },
  fundAppAccount: {
    label: "Top up",
    requires: ["appSigner"],
    satisfies: ["appAccountFunded"],
  },
  // TODO: do we need a finalizing step?
} as const satisfies Steps;

export const walletSteps = {
  ...initialSteps,
  connectWallet: {
    label: "Connect",
    requires: [],
    satisfies: ["walletConnected"],
  },
  createAppAccount: {
    label: "Sign in",
    requires: ["walletConnected"],
    satisfies: ["appSigner"],
  },
  delegateAppAccount: {
    label: "Set up account",
    requires: ["appSigner"],
    satisfies: ["appAccountDelegationPrepared"],
  },
  fundWallet: {
    label: "Top up", // other ideas: "Add funds", "Claim gas pass"
    requires: ["walletConnected"],
    satisfies: ["walletFunded"],
  },
  fundAppAccount: {
    label: "Top up",
    requires: ["appSigner"],
    satisfies: ["appAccountFunded"],
  },
  finalize: {
    label: "Finalizing",
    // TODO: only one account needs funding - which one?
    requires: ["walletFunded", "appAccountFunded", "appAccountDelegationPrepared"],
    satisfies: ["appAccountDelegation"],
  },
} as const satisfies Steps;

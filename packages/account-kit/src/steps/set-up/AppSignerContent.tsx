import { keccak256 } from "viem";
import { useSignMessage } from "wagmi";
import { useAppSigner } from "../../useAppSigner";
import { Button } from "../../ui/Button";
import { AccountModalContent } from "../../AccountModalContent";
import { useOnboardingSteps } from "../../useOnboardingSteps";
import { useConfig } from "../../MUDAccountKitProvider";
import { Logo } from "../../icons/Logo";
import { AccountModalTitle } from "../../AccoutModalTitle";

export function AppSignerContent() {
  const { appInfo } = useConfig();
  const [, setAppSigner] = useAppSigner();
  const { signMessageAsync, isPending } = useSignMessage();
  const { resetStep } = useOnboardingSteps();

  const appName = appInfo?.name ?? document.title;
  const appOrigin = location.hostname;

  // TODO: add "already signed" state

  return (
    <>
      <AccountModalTitle title={appName} />
      <AccountModalContent className="flex-grow bg-white dark:bg-neutral-700">
        {appInfo?.image ? (
          <img src={appInfo.image} />
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center p-5">
            {appInfo?.icon ? (
              <img src={appInfo.icon} />
            ) : (
              <div className="p-4">
                {/* TODO: swap with favicon */}
                <Logo className="w-16 h-16 text-orange-500 dark:bg-neutral-800" />
              </div>
            )}
            <div className="flex flex-col gap-1 items-center justify-center">
              <div className="text-2xl">{appName}</div>
              <div className="text-sm font-mono text-neutral-400">{appOrigin}</div>
            </div>
          </div>
        )}
      </AccountModalContent>
      <AccountModalContent>
        <div className="flex flex-col gap-5 p-5">
          {/* TODO: rework this copy */}
          <p>
            To get started with <span className="font-medium">{appName}</span> by proving your identity. You will be
            asked for a signature via your wallet. This will not cost you anything.
          </p>
          <Button
            className="self-stretch"
            pending={isPending}
            onClick={async () => {
              const signature = await signMessageAsync({
                // TODO: improve message, include location.origin
                message: "Create app-signer",
              });
              setAppSigner(keccak256(signature));
              resetStep();
            }}
          >
            Continue
          </Button>
        </div>
      </AccountModalContent>
    </>
  );
}

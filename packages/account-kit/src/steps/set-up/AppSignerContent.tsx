import * as Dialog from "@radix-ui/react-dialog";
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

  return (
    <>
      <AccountModalTitle title={appName} />
      <AccountModalContent className="flex-grow">
        {appInfo?.image ? (
          <img src={appInfo.image} />
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center p-5 gap-4">
            {appInfo?.icon ? (
              <img src={appInfo.icon} />
            ) : (
              <div className="">
                {/* TODO: swap with favicon */}
                <Logo className="w-16 h-16" />
              </div>
            )}
            <div className="flex flex-col items-center justify-center">
              <div className="text-2xl">{appName}</div>
              <div className="font-mono text-neutral-500">{appOrigin}</div>
            </div>
          </div>
        )}
      </AccountModalContent>
      <AccountModalContent>
        <div className="p-5">
          <div className="flex gap-3 justify-end">
            <Dialog.Close asChild>
              <Button variant="secondary">Cancel</Button>
            </Dialog.Close>
            <Button
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
              Generate signer
            </Button>
          </div>
        </div>
      </AccountModalContent>
    </>
  );
}

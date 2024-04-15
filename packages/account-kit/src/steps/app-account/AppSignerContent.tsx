import { keccak256 } from "viem";
import { useSignMessage } from "wagmi";
import { useAppSigner } from "../../useAppSigner";
import { Button } from "../../ui/Button";
import { AccountModalContent } from "../../AccountModalContent";
import { useOnboardingSteps } from "../../useOnboardingSteps";
import { AccountModalTitle } from "../../AccoutModalTitle";
import { usePreloadImage } from "../../usePreloadImage";
import { AppInfo } from "./AppInfo";
import { useAppInfo } from "../../useAppInfo";
import { getMessageToSign } from "./getMessageToSign";

export function AppSignerContent() {
  const { appName, appImage } = useAppInfo();
  const [, setAppSigner] = useAppSigner();
  const { signMessageAsync, isPending } = useSignMessage();
  const { resetStep } = useOnboardingSteps();

  const { data: hasAppImage } = usePreloadImage(appImage);

  // TODO: add "already signed" state

  return (
    <>
      <AccountModalTitle title="Create account" />
      <AccountModalContent className="flex-grow bg-white dark:bg-neutral-700">
        {hasAppImage ? <img src={appImage} className="w-full" /> : <AppInfo />}
      </AccountModalContent>
      <AccountModalContent>
        <div className="flex flex-col gap-6 px-5 py-6">
          {/* TODO: rework this copy */}
          <p>
            Get started with <span className="font-medium">{appName}</span> by proving your identity. You will be asked
            for a signature via your wallet. This will not cost you anything.
          </p>
          <Button
            className="self-stretch"
            pending={isPending}
            onClick={async () => {
              const signature = await signMessageAsync({
                // BE CAREFUL MODIFYING THESE ARGUMENTS!
                //
                // Once modified, all prior accounts will not be easily retrievable.
                message: getMessageToSign(location.host),
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

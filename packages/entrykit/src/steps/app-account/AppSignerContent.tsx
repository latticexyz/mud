import { keccak256 } from "viem";
import { useSignMessage } from "wagmi";
import { useAppSigner } from "../../useAppSigner";
import { Button } from "../../ui/Button";
import { AccountModalSection } from "../../AccountModalSection";
import { useOnboardingSteps } from "../../useOnboardingSteps";
import { AccountModalTitle } from "../../AccoutModalNav";
import { useAppInfo } from "../../useAppInfo";
import { getAppSignerMessage } from "./getAppSignerMessage";
import { ErrorNotice } from "../../ErrorNotice";

export function AppSignerContent() {
  const { appName } = useAppInfo();
  const [, setAppSigner] = useAppSigner();
  const { signMessageAsync, isPending, error } = useSignMessage();
  const { resetStep } = useOnboardingSteps();

  // TODO: add "already signed" state

  return (
    <>
      <AccountModalTitle title="Create account" />
      <AccountModalSection>
        <div className="flex flex-col gap-6 px-5 py-6">
          {error ? <ErrorNotice error={error} /> : null}

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
                message: getAppSignerMessage(location.host),
              });
              setAppSigner(keccak256(signature));
              resetStep();
            }}
          >
            Continue
          </Button>
        </div>
      </AccountModalSection>
    </>
  );
}

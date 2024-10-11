import { ConnectedClient } from "../common";
import { Steps } from "./Steps";
import { useSteps } from "./useSteps";

export type Props = {
  userClient: ConnectedClient;
};

export function ConnectedSteps({ userClient }: Props) {
  const steps = useSteps(userClient);
  return <Steps steps={steps} />;
}

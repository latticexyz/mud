import { twMerge } from "tailwind-merge";
import { Logo } from "./icons/Logo";
import { PopupContainer } from "./PopupContainer";
import { Button } from "./Button";
import { useMutation } from "@tanstack/react-query";

export type Props = {
  onCreateAccount: () => Promise<void>;
  onSignIn: () => Promise<void>;
};

export function LoginContainer({ onCreateAccount, onSignIn }: Props) {
  const createAccount = useMutation({
    mutationFn: onCreateAccount,
  });
  const signIn = useMutation({
    mutationFn: onSignIn,
  });

  return (
    <PopupContainer>
      <div className="grow self-center flex flex-col justify-center gap-12">
        <a
          href="https://id.place/"
          target="_blank"
          className="self-center p-4 -m-4 flex items-center justify-center gap-2 text-indigo-600"
        >
          <Logo className="text-4xl" />
          <h1 className="text-2xl font-mono font-semibold tracking-tighter">
            <span className="text-black">id</span>.place
          </h1>
        </a>
        <div className="flex flex-col gap-2">
          <Button
            className="text-lg"
            onClick={(event) => {
              event.preventDefault();
              createAccount.mutate();
            }}
            pending={createAccount.isPending}
          >
            Create account
          </Button>
          <Button
            variant="secondary"
            onClick={(event) => {
              event.preventDefault();
              signIn.mutate();
            }}
            pending={signIn.isPending}
          >
            Sign in
          </Button>
        </div>
        <p
          className={twMerge(
            "text-xs text-slate-500 text-center",
            "[&_a]:underline [&_a]:underline-offset-3 [&_a]:decoration-1 [&_a]:decoration-dotted",
            "[&_a]:underline-offset-4 [&_a]:hover:decoration-2 [&_a]:hover:decoration-solid",
          )}
        >
          A place for your internet identity.{" "}
          <a href="https://id.place/" target="_blank">
            Learn&nbsp;more.
          </a>
        </p>
      </div>
    </PopupContainer>
  );
}

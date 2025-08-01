import { twMerge } from "tailwind-merge";
import { Logo } from "./icons/Logo";
import { PopupContainer } from "./PopupContainer";
import { Button } from "./Button";
import { useMutation } from "@tanstack/react-query";

export type Props = {
  isNewUser: boolean;
  onCreateAccount: () => Promise<void>;
  onSignIn: () => Promise<void>;
};

export function LoginContainer({ isNewUser, onCreateAccount, onSignIn }: Props) {
  const createAccount = useMutation({
    mutationFn: onCreateAccount,
  });
  const signIn = useMutation({
    mutationFn: onSignIn,
  });

  const buttons = [
    <Button
      key="create"
      className={isNewUser ? "text-lg" : undefined}
      variant={isNewUser ? "primary" : "secondary"}
      onClick={() => createAccount.mutate()}
      pending={createAccount.isPending}
      autoFocus={isNewUser}
    >
      Create account
    </Button>,
    <Button
      key="signIn"
      className={!isNewUser ? "text-lg" : undefined}
      variant={!isNewUser ? "primary" : "secondary"}
      onClick={() => signIn.mutate()}
      pending={signIn.isPending}
      autoFocus={!isNewUser}
    >
      Sign in
    </Button>,
  ];

  if (!isNewUser) {
    buttons.reverse();
  }

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
        <div className="flex flex-col gap-2">{buttons}</div>
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

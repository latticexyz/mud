import { twMerge } from "tailwind-merge";
import { Logo } from "./icons/Logo";
import { PopupContainer } from "./PopupContainer";

export function LoginContainer() {
  return (
    <PopupContainer>
      <div className={twMerge("grow self-center flex flex-col justify-center gap-12")}>
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
          <button className="py-5 px-6 text-lg leading-none bg-indigo-600 hover:brightness-125 active:brightness-90 rounded text-white cursor-pointer">
            Create account
          </button>
          <button className="py-3 px-6 leading-none bg-indigo-400 hover:brightness-125 active:brightness-90 rounded text-white cursor-pointer">
            Sign in
          </button>
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

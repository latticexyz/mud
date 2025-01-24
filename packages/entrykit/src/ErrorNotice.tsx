import { twMerge } from "tailwind-merge";
import { BaseError, UserRejectedRequestError } from "viem";

export type Props = {
  title?: string;
  error?: unknown;
};

export function ErrorNotice({ title: initialTitle, error }: Props) {
  if (!error) return null;
  // no need to let users know they rejected
  if (error instanceof BaseError && error.walk((e) => e instanceof UserRejectedRequestError) != null) {
    return null;
  }

  // TODO: extract title from error name or first line of error message?
  const title = initialTitle ?? "Error";

  // TODO: do something to protect against `[object Object]`
  const message =
    typeof error === "string" ? error : error instanceof Error ? String(error) : "Something unexpected happened.";

  // TODO: add "report error" link

  return (
    <div
      className={twMerge(
        "text-sm border-l-4 border-red-500",
        "bg-red-100 text-red-900",
        "dark:bg-red-900 dark:text-red-50",
      )}
    >
      <div className="p-3 font-semibold">{title}</div>
      <div className="px-3 whitespace-break-spaces break-all max-h-32 overflow-y-scroll">{message}</div>
    </div>
  );
}

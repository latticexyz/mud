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
        "text-sm p-3 border-l-4",
        "bg-red-100 border-red-500 text-red-900",
        "dark:bg-red-100 dark:border-red-500 dark:text-red-900",
      )}
    >
      <div className="font-semibold">{title}</div>
      <div className="-mb-3 pb-3 whitespace-break-spaces break-all max-h-32 overflow-y-scroll">{message}</div>
    </div>
  );
}

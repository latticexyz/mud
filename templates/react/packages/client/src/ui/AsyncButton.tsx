import { DetailedHTMLProps, ButtonHTMLAttributes, useState, useRef, useCallback, MouseEventHandler } from "react";

export type AsyncButtonProps = {
  pending?: boolean;
};

export type Props = AsyncButtonProps & DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;

export const AsyncButton = ({ pending, type, disabled, onClick, ...props }: Props) => {
  // TODO: move all this logic into a hook so we can wrap other event handlers

  const promiseRef = useRef<Promise<unknown>>();
  const [promisePending, setPromisePending] = useState<true | undefined>(undefined);

  const asyncOnClick = useCallback<MouseEventHandler<HTMLButtonElement>>(
    (...args) => {
      if (!onClick) return;
      const result = onClick(...args);
      const promise = Promise.resolve(result);
      promiseRef.current = promise;
      setPromisePending(true);
      promise.finally(() => {
        if (promiseRef.current === promise) {
          setPromisePending(undefined);
        }
      });
    },
    [onClick],
  );

  return (
    <button
      type={type || "button"}
      aria-busy={pending || promisePending}
      aria-disabled={disabled}
      disabled={disabled || pending || promisePending}
      onClick={onClick ? asyncOnClick : undefined}
      {...props}
    />
  );
};

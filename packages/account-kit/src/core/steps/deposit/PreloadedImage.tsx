import { ReactNode } from "react";
import { usePreloadImage } from "../../usePreloadImage";
import { twMerge } from "tailwind-merge";

export type Props = {
  url: string | undefined;
  fallback?: ReactNode;
  className?: string;
};

export function PreloadedImage({ url, fallback, className }: Props) {
  const { isSuccess, isLoading } = usePreloadImage(url);
  // TODO: center object + fallback
  // TODO: fade in?
  return (
    <span className={twMerge("inline-flex w-full h-full items-center justify-center overflow-clip", className)}>
      {!isLoading ? isSuccess ? <img src={url} className="w-full h-full object-cover" /> : fallback : null}
    </span>
  );
}

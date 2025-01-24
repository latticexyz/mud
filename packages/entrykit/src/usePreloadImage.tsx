import { useQuery } from "@tanstack/react-query";

export function usePreloadImage(url: string | undefined) {
  return useQuery({
    enabled: !!url,
    retry: false,
    retryOnMount: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    queryKey: ["preloadImage", url],
    queryFn: () =>
      new Promise<InstanceType<typeof Image>>((resolve, reject) => {
        if (!url) throw new Error("usePreloadImage: Must provide `url` to preload image.");
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error(`usePreloadImage: Could not load image.\n\n\tURL: ${url}`));
        image.src = url;
      }),
  });
}

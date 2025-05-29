"use client";

import { useParams, useRouter } from "next/navigation";
import queryString from "query-string";
import { useEffect, useMemo, useState } from "react";

// source: https://github.com/vercel/next.js/discussions/49465
export function useHashState() {
  const getCurrentHash = useMemo(
    () => () => (typeof window !== "undefined" ? window.location.hash.replace(/^#!?/, "") : ""),
    [],
  );

  const router = useRouter();
  const params = useParams();
  const [hash, _setHash] = useState<string>(getCurrentHash());

  const setHash = (newHash: string) => {
    let updatedUrl = window.location.href;
    updatedUrl = queryString.stringifyUrl({
      url: updatedUrl.split("#")[0] ?? "",
      fragmentIdentifier: newHash,
    });

    _setHash(newHash);
    router.replace(updatedUrl);
  };
  useEffect(() => {
    const currentHash = getCurrentHash();
    _setHash(currentHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const handleHashChange = () => {
    const currentHash = getCurrentHash();
    _setHash(currentHash);
  };

  useEffect(() => {
    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [hash, setHash] as const;
}

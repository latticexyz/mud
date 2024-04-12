import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import { Deferred, defer } from "@latticexyz/common/utils";
import { UseMutationResult, useMutation } from "@tanstack/react-query";

export function useConnect(): UseMutationResult<void, Error, void, void> {
  const pending = useRef<Set<Deferred<void>>>(new Set());

  const { status: accountStatus } = useAccount();
  const { connectModalOpen, openConnectModal } = useConnectModal();

  useEffect(() => {
    if (accountStatus === "connected") {
      for (const deferred of pending.current) {
        deferred.resolve();
        pending.current.delete(deferred);
      }
    }
  }, [accountStatus]);

  useEffect(() => {
    // TODO: skip when `accountStatus` is `connecting`?
    if (!connectModalOpen) {
      for (const deferred of pending.current) {
        deferred.reject(new Error("Connect modal was closed before connecting."));
        pending.current.delete(deferred);
      }
    }
  }, [connectModalOpen]);

  return useMutation({
    mutationFn: async () => {
      // TODO: do something else in this state?
      if (!openConnectModal) throw new Error("`openConnectModal` not yet ready.");

      const deferred = defer<void>();
      pending.current.add(deferred);

      openConnectModal();

      return await deferred.promise;
    },
  });
}

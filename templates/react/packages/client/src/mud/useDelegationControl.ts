import { ComponentValue, Type, getComponentValue } from "@latticexyz/recs";
import { useEffect, useState } from "react";
import { WalletClient, Transport, Chain, Account } from "viem";
import { encodeEntity } from "@latticexyz/store-sync/recs";
import { ClientComponents } from "./createClientComponents";

export function useDelegationControl(
  delegator: WalletClient<Transport, Chain, Account> | null | undefined,
  delegatee: WalletClient<Transport, Chain, Account>,
  components: ClientComponents
) {
  const [delegationControlId, setDelegationControlId] = useState<
    | ComponentValue<
        {
          __staticData: Type.OptionalString;
          __encodedLengths: Type.OptionalString;
          __dynamicData: Type.OptionalString;
        } & {
          delegationControlId: Type.String;
        },
        unknown
      >
    | undefined
  >(undefined);

  useEffect(() => {
    if (!delegator) return;

    const delegationsKeyEntity = encodeEntity(components.Delegations.metadata.keySchema, {
      delegator: delegator.account.address,
      delegatee: delegatee.account.address,
    });
    const delegationControlId = getComponentValue(components.Delegations, delegationsKeyEntity);

    console.log({
      delegationsKeyEntity,
      delegator: delegator.account.address,
      delegatee: delegatee.account.address,
      delegationControlId,
      delegations: [...components.Delegations.entities()],
    });
    setDelegationControlId(delegationControlId);

    // TODO what's the cleanup fn?
  }, [delegator]);

  return delegationControlId;
}

import * as Actions from "porto/remote/Actions";
import { useLocation } from "react-router";
import { porto } from "../../../src/popup/porto";
import { RequestContainer } from "../../../src/ui/RequestContainer";
import { twMerge } from "tailwind-merge";
import { RpcRequest } from "ox";
import { RpcSchema } from "porto";
import { TruncatedHex } from "../../../src/ui/TruncatedHex";
import { decodeFunctionData, formatEther, stringify } from "viem";
import { worldAbi } from "../../../src/worldAbi";
import { LineClamp } from "../../../src/ui/LineClamp";
import { Fragment } from "react";
import { Hooks } from "porto/remote";

// TODO: show the origin of the call

export function SendCalls() {
  const location = useLocation();
  // TODO: abstract this to get a typed request
  const searchParams = new URLSearchParams(location.search);
  const request = JSON.parse(searchParams.get("request")!) as Extract<
    RpcRequest.RpcRequest<RpcSchema.Schema>,
    { method: "wallet_sendCalls" }
  >;

  // TODO: move this validation somewhere else
  if (request.params.length > 1) {
    throw new Error("Calling `wallet_sendCalls` with more than one `params` entry is not yet supported.");
  }
  const { from, calls } = request.params[0];
  const accounts = Hooks.usePortoStore(porto, (state) => state.accounts);
  const account = accounts.find((account) => from != null && account.address === from);
  if (!account) throw new Error("no account");

  return (
    <RequestContainer
      account={account}
      onApprove={() => Actions.respond(porto, request).catch(() => Actions.reject(porto, request))}
      onCancel={() => Actions.reject(porto, request)}
    >
      <div className="grow flex flex-col gap-4">
        <h1 className="text-center text-xl font-medium leading-snug">Transaction request</h1>
        {calls.map((call, i) => {
          const value = call.value ? BigInt(call.value) : null;

          const decodedCall = (() => {
            if (!call.data) return;
            try {
              return decodeFunctionData({
                abi: worldAbi,
                data: call.data,
              });
            } catch (error) {
              return;
            }
          })();

          return (
            <dl
              key={i}
              className={twMerge(
                "grow bg-indigo-50 rounded p-4",
                "grid grid-cols-[auto_1fr] place-content-start gap-x-4 gap-y-2",
                "text-sm leading-snug break-all",
                "[&_dt]:text-slate-500",
              )}
            >
              <dt>To</dt>
              <dd>
                {/* TODO: link to block explorer */}
                <span className="font-mono">
                  <TruncatedHex hex={call.to} />
                </span>
              </dd>
              {value ? (
                <>
                  <dt>Value</dt>
                  <dd>{formatEther(value)} ETH</dd>
                </>
              ) : null}
              {decodedCall ? (
                <>
                  <dt>Function</dt>
                  <dd className="font-mono">{decodedCall.functionName}</dd>
                  <dt>Args</dt>
                  <dd>
                    <dl
                      className={twMerge(
                        "grid grid-cols-[auto_1fr] place-content-start gap-x-1 gap-y-1",
                        "text-sm leading-snug break-all",
                        "[&_dt]:text-slate-500",
                        "[&_dd]:font-mono",
                      )}
                    >
                      {decodedCall.args.map((arg, i) => (
                        <Fragment key={i}>
                          <dt>{i}:</dt>
                          <dd>{stringify(arg)}</dd>
                        </Fragment>
                      ))}
                    </dl>
                  </dd>
                </>
              ) : call.data ? (
                <>
                  <dt>Call data</dt>
                  <dd className="font-mono">
                    <LineClamp>{call.data}</LineClamp>
                  </dd>
                </>
              ) : null}
            </dl>
          );
        })}
      </div>
    </RequestContainer>
  );
}

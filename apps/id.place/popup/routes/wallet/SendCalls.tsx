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

  const referrer = document.referrer ? new URL(document.referrer) : undefined;

  return (
    <RequestContainer
      account={account}
      onApprove={() => Actions.respond(porto, request).catch(() => Actions.reject(porto, request))}
      onCancel={() => Actions.reject(porto, request)}
    >
      <div className="grow flex flex-col gap-4">
        <h1 className="text-center text-xl font-medium">Transaction request</h1>

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
            <div key={i} className="flex flex-col gap-2">
              <dl
                className={twMerge(
                  "grid grid-cols-[auto_1fr] place-content-start gap-x-4 gap-y-2",
                  "text-sm leading-snug break-all",
                  "[&_dt]:text-slate-500",
                )}
              >
                {referrer ? (
                  <>
                    <dt>Request from</dt>
                    <dd>{referrer.host}</dd>
                  </>
                ) : null}
                <dt>Interacting with</dt>
                <dd className="font-mono">
                  {/* TODO: link to block explorer */}
                  <TruncatedHex hex={call.to} />
                </dd>
                {value ? (
                  <>
                    <dt>Value</dt>
                    <dd>{formatEther(value)} ETH</dd>
                  </>
                ) : null}
                {decodedCall ? (
                  <>
                    <dt>Call</dt>
                    <dd className="col-span-2">
                      <textarea className="font-mono p-2 rounded bg-indigo-50 w-full" rows={4} readOnly>
                        {`${decodedCall.functionName}(\n${decodedCall.args.map((arg) => `  ${stringify(arg)}`).join(",\n")}\n)`}
                      </textarea>
                    </dd>
                  </>
                ) : call.data ? (
                  <>
                    <dt>Call data</dt>
                    <dd className="col-span-2">
                      <textarea className="font-mono p-2 rounded bg-indigo-50 w-full" rows={4} readOnly>
                        {call.data}
                      </textarea>
                    </dd>
                  </>
                ) : null}
              </dl>
            </div>
          );
        })}
      </div>
    </RequestContainer>
  );
}

import { ReactNode } from "react";
import { defaultSize } from "@latticexyz/id/internal";
import { LoginContainer } from "../src/ui/LoginContainer";
import { RequestContainer } from "../src/ui/RequestContainer";
import { twMerge } from "tailwind-merge";

export function Playground() {
  return (
    <div className="p-4 *:m-6">
      <Popup>
        <LoginContainer />
      </Popup>
      <Popup>
        <RequestContainer>
          <div className="grow flex flex-col gap-3">
            <h1 className="text-center text-xl font-medium">Transaction request</h1>
            <dl
              className={twMerge(
                "grow bg-white/50 rounded",
                "grid grid-cols-[auto_1fr] place-content-start gap-x-4 gap-y-2 p-4 leading-snug",
                "text-sm break-all",
                "[&_dt]:text-slate-500",
              )}
            >
              <dt>System</dt>
              <dd>Delegation</dd>
              <dt>Spender</dt>
              <dd>0x893EC2238Dfa089469191159acdE0bB2033a9661</dd>
              <dt>Nonce</dt>
              <dd>234</dd>
              <dt>Chain ID</dt>
              <dd>690</dd>
            </dl>
          </div>
        </RequestContainer>
      </Popup>
    </div>
  );
}

function Popup({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="inline-block border border-neutral-300 divide-y divide-neutral-300 shadow-xl rounded-lg overflow-hidden">
      <div className="bg-neutral-100 grid grid-cols-[auto_1fr] gap-2 p-2 w-full">
        <div className="row-start-1 col-start-1 flex gap-1.5 items-center">
          <div className="size-3 bg-red-400 rounded-full"></div>
          <div className="size-3 bg-yellow-500 rounded-full"></div>
          <div className="size-3 bg-green-500 rounded-full"></div>
        </div>
        <div className="row-start-1 col-start-1 col-span-2 text-center text-sm leading-none font-bold text-neutral-600">
          {title ?? "id.place"}
        </div>
      </div>
      <div className="bg-white overflow-auto" style={defaultSize}>
        {children}
      </div>
    </div>
  );
}

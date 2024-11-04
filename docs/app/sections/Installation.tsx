"use client";

import Image from "next/image";
import { Container } from "../../components/ui/Container";
import { Section } from "../../components/ui/Section";
import { CopyToClipboard } from "react-copy-to-clipboard";

export default function Installation() {
  return (
    <Section className="bg-black pt-10 pb-12">
      <Container>
        <div className="grid grid-cols-2 gap-[60px] lg:gap-[80px]">
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="uppercase text-sm text-white/50 font-mono">Get started</h2>
              <h3 className="font-mono text-xl flex items-center gap-5">
                <span>
                  &gt; pnpm create <span className="text-mud">mud</span>
                </span>
                {/* TODO: add copy to clipboard */}
                <CopyToClipboard text="pnpm install mud" onCopy={() => {}}>
                  <Image
                    src="/images/icons/clipboard.svg"
                    alt="pnpm install mud"
                    width={28}
                    height={28}
                    className="cursor-pointer"
                  />
                </CopyToClipboard>
              </h3>
            </div>

            <p className="text-sm">
              Building a complex onchain game has never been easier. You can get going in seconds with the MUD starter
              project, which has everything you need to start coding.
            </p>

            <div className="border-l border-l-mud pl-4 space-y-2">
              <h4 className="font-mono uppercase text-[16px] text-white/50">packages/contracts</h4>
              <p className="text-sm">All of your onchain logic will live here.</p>
            </div>

            <div className="border-l border-l-mud pl-4 space-y-2">
              <h4 className="font-mono uppercase text-[16px] text-white/50 ">packages/client</h4>
              <p className="text-sm">
                The user interface for your onchain app, served via <b>vite</b>, with a set of developer tools to help
                you inspect current state.
              </p>
            </div>

            <a href="#" className="text-sm px-5 py-4 leading-none font-mono uppercase bg-light-gray inline-block">
              Curious to learn more? <span className="text-mud">Read the docs →</span>
            </a>
          </div>

          <div>
            <div className="h-[313px] w-full bg-light-gray"></div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

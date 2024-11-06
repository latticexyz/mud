"use client";

import Link from "next/link";
import { Container } from "../../components/ui/Container";
import { Section } from "../../components/ui/Section";
import CopyButton from "../../components/ui/CopyButton";
import VideoPlayer from "../../components/ui/VideoModal";

const videoId = "07b2e147a732cb52ffff39165f35a498";

export default function Installation() {
  return (
    <Section className="bg-black py-8 md:pt-10 md:pb-12">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-[60px] xl:gap-[80px]">
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="uppercase text-sm text-white/50 font-mono">Get started</h2>
              <h3 className="font-mono text-md sm:text-xl flex items-center gap-5">
                <span>
                  &gt; pnpm create <span className="text-mud">mud</span>
                </span>

                <CopyButton value="pnpm create mud" />
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

            <Link
              href="/introduction"
              className="text-sm px-5 w-full md:w-fit py-3 leading-8 font-mono uppercase bg-light-gray inline-block"
            >
              Curious to learn more? <span className="text-mud whitespace-nowrap">Read the docs →</span>
            </Link>
          </div>

          <div>
            <div className="h-[313px] w-full bg-light-gray mt-10">
              <VideoPlayer videoId={videoId} thumbnailUrl="/videos/mud-create.png" />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

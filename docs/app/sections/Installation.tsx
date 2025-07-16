"use client";

import Link from "next/link";
import { Container } from "../../components/ui/Container";
import { Section } from "../../components/ui/Section";
import CopyButton from "../../components/ui/CopyButton";
import VideoPlayer from "../../components/ui/VideoModal";
import Image from "next/image";

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
              MUD powers some of the most complex and fascinating applications onchain. But getting started is as easy
              as running pnpm create mud, to create your very own MUD project.
            </p>

            <p className="text-sm">
              From there, choose one of the frontend templates—from React to Three.js—to visualize your world. Then,
              start building your world and see it come to life with a built-in development server and automatic
              contract hot reloading.
            </p>

            <Link
              href="/introduction"
              className="text-sm px-5 w-full md:w-fit py-3 leading-8 font-mono uppercase bg-light-gray inline-block"
            >
              Curious to learn more? <span className="text-mud whitespace-nowrap">Read the docs →</span>
            </Link>
          </div>

          <div>
            <VideoPlayer videoId={videoId}>
              <div className="w-full bg-light-gray mt-10 relative">
                <div className="absolute inset-0 bg-black/30 z-10" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 h-[79px] w-[79px] flex items-center justify-center z-20">
                  <Image src="/images/icons/play.svg" alt="Play" width={32} height={32} />
                </div>

                <Image
                  src="/images/mud-video-thumbnail.jpg"
                  alt="mud video thumbnail"
                  width={560}
                  height={313}
                  className="w-full"
                />
              </div>
            </VideoPlayer>
          </div>
        </div>
      </Container>
    </Section>
  );
}

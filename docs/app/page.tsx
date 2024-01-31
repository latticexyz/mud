import { LatticeIcon } from "../src/icons/LatticeIcon";
import { Metadata } from "next";
import Link from "next/link";
import { twMerge } from "tailwind-merge";
import { SourceIcon } from "../src/icons/SourceIcon";
import { DocsIcon } from "../src/icons/DocsIcon";
import { StatusIcon } from "../src/icons/StatusIcon";
import { CalendarIcon } from "../src/icons/CalendarIcon";
import { ContributeIcon } from "../src/icons/ContributeIcon";
import { ChangelogIcon } from "../src/icons/ChangelogIcon";

export const metadata: Metadata = {
  title: "MUD",
  description: "Battle-tested onchain framework for developers.",
  icons: "/images/logos/circle/mud.svg",
};

export default async function HomePage() {
  return (
    <>
      <div className="bg-mud">
        <div
          className={twMerge(
            "min-h-screen flex flex-col animate-in animate-duration-500 fade-in",
            "gap-12 p-8",
            "sm:justify-between",
            "md:gap-16 md:p-16"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="font-mono text-3xl uppercase sm:text-4xl">MUD</div>
            <a
              href="https://lattice.xyz"
              className="shrink-0 flex md:flex-row-reverse items-center gap-3 p-3 -m-3 font-mono md:text-lg uppercase leading-none transition hover:bg-white hover:text-mud"
            >
              <span>
                Built by
                <span className="hidden md:inline"> Lattice</span>
              </span>
              <LatticeIcon />
            </a>
          </div>
          <div className={twMerge("grow flex flex-col md:flex-row-reverse", "gap-12", "md:gap-y-16")}>
            <div className="grow md:grow-0 flex items-center md:items-end justify-center">
              <img
                src="/images/logos/mud-white.svg"
                className="aspect-square max-w-none w-[12rem] sm:w-[16rem] md:w-[14rem] lg:w-[18rem]"
              />
            </div>
            <div className="space-y-8 md:grow md:self-end">
              <div className="space-y-4">
                <div className="max-w-2xl font-mono text-3xl sm:text-3xl md:text-4xl lg:text-5xl uppercase [text-wrap:balance]">
                  Battle-tested onchain framework for developers.
                </div>
                <p className="max-w-lg text-xl md:text-2xl [text-wrap:balance]">
                  MUD provides you with the tools to build ambitious onchain applications.
                </p>
              </div>
              <div className="flex gap-4">
                <Link
                  href="/introduction"
                  className="bg-white p-4 font-mono uppercase leading-none text-mud transition hover:bg-black hover:text-white"
                >
                  Documentation
                </Link>
                <a
                  href="https://github.com/latticexyz/mud"
                  className="hover: bg-white/20 p-4 font-mono uppercase leading-none transition hover:bg-black hover:text-white"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Source
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={twMerge("bg-black flex flex-col", "gap-12 p-8", "md:gap-16 md:p-16")}>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="font-mono uppercase text-2xl">Resources</div>
            <p className="text-lg text-white/60">
              Discover more about the open source framework powering complex games & apps on Ethereum.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <a
              href="https://github.com/latticexyz/mud"
              target="_blank"
              rel="noopener noreferrer"
              // eslint-disable-next-line max-len
              className="flex items-center gap-4 bg-white/10 border border-white/20 p-6 font-mono uppercase text-lg leading-none transition hover:bg-mud hover:border-transparent"
            >
              <SourceIcon />
              Source code
            </a>
            <Link
              href="/changelog"
              // eslint-disable-next-line max-len
              className="flex items-center gap-4 bg-white/10 border border-white/20 p-6 font-mono uppercase text-lg leading-none transition hover:bg-mud hover:border-transparent"
            >
              <ChangelogIcon />
              Changelog
            </Link>
            <Link
              href="/introduction"
              // eslint-disable-next-line max-len
              className="flex items-center gap-4 bg-white/10 border border-white/20 p-6 font-mono uppercase text-lg leading-none transition hover:bg-mud hover:border-transparent"
            >
              <DocsIcon />
              Documentation
            </Link>
            <a
              href="https://contribute.mud.dev/"
              target="_blank"
              rel="noopener noreferrer"
              // eslint-disable-next-line max-len
              className="flex items-center gap-4 bg-white/10 border border-white/20 p-6 font-mono uppercase text-lg leading-none transition hover:bg-mud hover:border-transparent"
            >
              <ContributeIcon />
              Contribute
            </a>
            <a
              href="https://status.mud.dev/"
              target="_blank"
              rel="noopener noreferrer"
              // eslint-disable-next-line max-len
              className="flex items-center gap-4 bg-white/10 border border-white/20 p-6 font-mono uppercase text-lg leading-none transition hover:bg-mud hover:border-transparent"
            >
              <StatusIcon />
              Status
            </a>
            <a
              href="https://roadmap.mud.dev/"
              target="_blank"
              rel="noopener noreferrer"
              // eslint-disable-next-line max-len
              className="flex items-center gap-4 bg-white/10 border border-white/20 p-6 font-mono uppercase text-lg leading-none transition hover:bg-mud hover:border-transparent"
            >
              <CalendarIcon />
              Roadmap
            </a>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="font-mono uppercase text-2xl">Projects</div>
            <p className="text-lg text-white/60">Start using a wide ecosystem of projects powered by MUD.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <a
              href="https://skystrife.xyz/"
              target="_blank"
              rel="noopener noreferrer"
              className="group border border-white/20 grid overflow-hidden"
            >
              <span
                className="z-10 row-start-1 col-start-1 flex flex-col gap-4 p-12 font-mono uppercase leading-none"
                style={{ textShadow: "0 3px 6px #000" }}
              >
                <span className="text-2xl leading-none">Sky Strife</span>
                <span>An onchain strategy game</span>
              </span>
              <span
                className="row-start-1 col-start-1 bg-cover bg-center grayscale opacity-30 transition group-hover:grayscale-0 group-hover:opacity-50 group-hover:scale-105"
                style={{ backgroundImage: "url('/images/projects/sky-strife.png')" }}
              />
            </a>
            <a
              href="https://craft.mud.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="group border border-white/20 grid overflow-hidden"
            >
              <span
                className="z-10 row-start-1 col-start-1 flex flex-col gap-4 p-12 font-mono uppercase leading-none"
                style={{ textShadow: "0 3px 6px #000" }}
              >
                <span className="text-2xl leading-none">OPCraft</span>
                <span>Voxel crafting game on OP Stack</span>
              </span>
              <span
                className="row-start-1 col-start-1 bg-cover bg-center grayscale opacity-30 transition group-hover:grayscale-0 group-hover:opacity-50 group-hover:scale-105"
                style={{ backgroundImage: "url('/images/projects/opcraft.png')" }}
              />
            </a>
            <a
              href="https://www.primodium.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="group border border-white/20 grid overflow-hidden"
            >
              <span
                className="z-10 row-start-1 col-start-1 flex flex-col gap-4 p-12 font-mono uppercase leading-none"
                style={{ textShadow: "0 3px 6px #000" }}
              >
                <span className="text-2xl leading-none">Primodium</span>
                <span>An onchain city-building game</span>
              </span>
              <span
                className="row-start-1 col-start-1 bg-cover bg-center grayscale opacity-30 transition group-hover:grayscale-0 group-hover:opacity-50 group-hover:scale-105"
                style={{ backgroundImage: "url('/images/projects/primodium.png')" }}
              />
            </a>
            <a
              href="https://www.words3.xyz/"
              target="_blank"
              rel="noopener noreferrer"
              className="group border border-white/20 grid overflow-hidden"
            >
              <span
                className="z-10 row-start-1 col-start-1 flex flex-col gap-4 p-12 font-mono uppercase leading-none"
                style={{ textShadow: "0 3px 6px #000" }}
              >
                <span className="text-2xl leading-none">Words3</span>
                <span>Onchain scrabble</span>
              </span>
              <span
                className="row-start-1 col-start-1 bg-cover bg-center grayscale opacity-30 transition group-hover:grayscale-0 group-hover:opacity-50 group-hover:scale-105"
                style={{ backgroundImage: "url('/images/projects/words3.png')" }}
              />
            </a>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="font-mono uppercase text-2xl">Find us</div>
            <p className="text-lg text-white/60">Discover more MUD resources, and join our community online.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a
              href="https://world.mirror.xyz/"
              // eslint-disable-next-line max-len
              className="flex items-center gap-4 bg-white/10 border border-white/20 p-6 font-mono uppercase text-lg leading-none transition hover:bg-mud hover:border-transparent"
            >
              Magazine
            </a>
            <a
              href="https://discord.lattice.xyz/"
              target="_blank"
              rel="noopener noreferrer"
              // eslint-disable-next-line max-len
              className="flex items-center gap-4 bg-white/10 border border-white/20 p-6 font-mono uppercase text-lg leading-none transition hover:bg-mud hover:border-transparent"
            >
              Discord
            </a>
            <a
              href="https://twitter.com/latticexyz"
              target="_blank"
              rel="noopener noreferrer"
              // eslint-disable-next-line max-len
              className="flex items-center gap-4 bg-white/10 border border-white/20 p-6 font-mono uppercase text-lg leading-none transition hover:bg-mud hover:border-transparent"
            >
              Twitter
            </a>
            <a
              href="https://www.youtube.com/@latticexyz"
              target="_blank"
              rel="noopener noreferrer"
              // eslint-disable-next-line max-len
              className="flex items-center gap-4 bg-white/10 border border-white/20 p-6 font-mono uppercase text-lg leading-none transition hover:bg-mud hover:border-transparent"
            >
              YouTube
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

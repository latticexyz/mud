import { LatticeIcon } from "../../src/icons/LatticeIcon";
import Link from "next/link";
import { cn } from "../../lib/cn";
import { Section } from "../../components/ui/Section";
import { Container } from "../../components/ui/Container";
import Image from "next/image";

export default function Hero() {
  return (
    <Section className="bg-mud">
      <Container>
        <div
          className={cn(
            "flex flex-col animate-in animate-duration-500 fade-in mt-12 mb-16",
            "gap-12",
            "sm:justify-between",
            "md:gap-16",
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

          <div className={cn("grow flex flex-col mt-[190px] md:flex-row-reverse gap-12 md:gap-y-16")}>
            <div className="grow md:grow-0 flex items-center md:items-end justify-center">
              <img
                src="/images/logos/mud-white.svg"
                className="aspect-square max-w-none w-[12rem] sm:w-[16rem] md:w-[14rem] lg:w-[18rem]"
              />
            </div>
            <div className="space-y-8 md:grow md:self-end">
              <div className="space-y-4">
                <div className="max-w-2xl font-mono text-2xl  uppercase [text-wrap:balance]">
                  Open-source engine for autonomous worlds
                </div>
                <p className="max-w-2xl text-md [text-wrap:balance]">
                  MUD reduces the complexity of building Ethereum apps with a tightly integrated software stack.
                </p>
              </div>
              <div className="flex gap-4">
                <Link
                  href="/introduction"
                  className="bg-white leading-[54px] px-4 font-mono uppercase text-mud transition"
                >
                  Documentation
                </Link>
                <a
                  href="https://github.com/latticexyz/mud"
                  className="px-4 font-mono uppercase leading-[54px] transition bg-transparent border hover:text-white flex items-center gap-3 border-white/50"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image src="/images/icons/github.svg" alt="GitHub" width={22} height={22} />
                  Source
                </a>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
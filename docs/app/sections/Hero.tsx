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
            "flex flex-col animate-in animate-duration-500 fade-in mt-8 mb-8",
            "gap-12",
            "sm:justify-between",
            "md:gap-16 md:mt-12 md:mb-16",
          )}
        >
          <div className="flex items-center justify-between">
            <h1 className="font-mono text-3xl uppercase sm:text-4xl">MUD</h1>
          </div>

          <div className="grow flex flex-col mt-[30px] lg:mt-[190px] md:flex-row-reverse gap-6 md:gap-y-16">
            <div className="grow md:grow-0 flex items-center md:items-end md:justify-center">
              <Image
                src="/images/logos/mud-white.svg"
                alt="MUD"
                width={274}
                height={274}
                className="aspect-square max-w-none w-[12rem] sm:w-[16rem] md:w-[14rem] lg:w-[18rem]"
              />
            </div>

            <div className="space-y-8 md:grow md:self-end">
              <div className="space-y-5">
                <a
                  href="https://lattice.xyz"
                  className="shrink-0 flex items-center gap-3 p-3 -m-3 font-mono text-sm uppercase leading-none"
                >
                  <span className="text-lg">
                    <LatticeIcon />
                  </span>
                  <span>Built by Lattice</span>
                </a>

                <div className="max-w-2xl font-mono text-xl sm:text-2xl uppercase text-wrap:balance">
                  Open-source engine for autonomous worlds
                </div>
                <p className="max-w-2xl text-sm sm:text-md [text-wrap:balance]">
                  MUD reduces the complexity of building Ethereum apps with a tightly integrated software stack.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
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

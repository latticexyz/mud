"use client";

import Image from "next/image";
import { Section } from "../../../components/ui/Section";
import { Container } from "../../../components/ui/Container";
import { cn } from "../../../lib/cn";
import { projects } from "./projects";

export default function Ecosystem() {
  return (
    <Section className="pb-[70px] pt-[60px] bg-light-gray">
      <Container>
        <div className="space-y-3">
          <h2 className="font-mono uppercase text-lg md:text-xl">Ecosystem</h2>
          <p className="text-white/70 text-sm md:text-md">Start using a wide ecosystem of projects powered by MUD.</p>
        </div>

        <div className="flex flex-wrap md:mt-[32px] md:gap-[22px]">
          {projects?.map((project, index) => {
            return (
              <a
                href={project.url}
                key={index}
                rel="noopener noreferrer"
                target="_blank"
                className={cn(
                  "flex flex-col justify-center items-center md:justify-between",
                  "w-full h-[104px] md:h-[96px] md:w-[calc(50%-12px)] lg:w-[calc(33.333%-15px)]",
                  "text-white",
                  "border-b-2 border-white/10 md:border md:hover:border-white/30",
                  "md:relative",
                )}
              >
                <Image
                  className="absolute left-0 top-0 z-[-1] hidden h-full w-full bg-gray-light bg-cover bg-center md:block"
                  src={project.bgImage}
                  alt={project.name}
                  width="368"
                  height="156"
                  style={{ zIndex: "1" }}
                />

                <div
                  className={cn(
                    "w-full",
                    "transition-bg transition-border duration-300",
                    "md:px-[27px] md:py-[24px] md:bg-black/90 md:hover:bg-black/60 md:h-full",
                  )}
                  style={{ zIndex: "2" }}
                >
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center justify-start gap-[17px]">
                      <Image src={project.icon} alt={`${project.name} title`} width="46" height="46" />
                      <h3 className="font-mono text-[24px] uppercase leading-[28px]">{project.name}</h3>
                    </div>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}

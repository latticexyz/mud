"use client";

import { Container } from "../../../components/ui/Container";
import { Section } from "../../../components/ui/Section";
import { GitHubStars } from "./GitHubStars";
import Contributors from "./Contributors";
import Projects from "./Projects";

export default async function TrustedBy() {
  return (
    <Section className="bg-[#E56A10] border-t border-t-white/20 py-8 lg:py-8">
      <Container>
        <div className="space-y-8">
          <div className="flex gap-2 md:gap-[22px] lg:items-center flex-col lg:flex-row">
            <h2 className="text-lg md:text-xl uppercase font-mono">Trusted by many</h2>
            <span className="bg-white/30 w-[1px] h-[50px] hidden lg:inline-block" />
            <p className="text-sm md:text-md">
              MUD is well established and trusted by leading teams across the industry.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-4 w-full">
            <GitHubStars />
            <Contributors />
            <Projects />
          </div>
        </div>
      </Container>
    </Section>
  );
}

"use client";

import { Container } from "../../components/ui/Container";
import { Section } from "../../components/ui/Section";
import Image from "next/image";

// TODO: fetch dynamically
const contributors = [
  "/avatars/alvarius.png",
  "/avatars/tdot.png",
  "/avatars/frolic.png",
  "/avatars/kumpis.jpeg",
  "/avatars/tux.jpg",
  "/avatars/vdrg.png",
  "/avatars/ludens.png",
];

export default function TrustedBy() {
  return (
    <Section className="bg-[#E56A10] border-t border-t-white/20">
      <Container>
        <div className="mt-[50px] flex items-center gap-[82px]">
          <div>
            <div className="flex h-[42px] items-center">
              <Image src="/illustrations/github-stars-graph.svg" alt="stars" width="173" height="38" />
            </div>
            <p className="font-mono-secondary mt-[16px] text-[19px]">
              <span className="font-bold">3,325</span>
              <span className="ml-3 font-light opacity-50">stars</span>
            </p>
          </div>

          <div>
            <div className="flex h-[42px] items-center">
              {contributors.map((contributor) => (
                <Image
                  key={contributor}
                  src={contributor}
                  alt="frolic"
                  width="41"
                  height="41"
                  className="-ml-2.5 overflow-hidden rounded-full border-[3px] border-[#E56A10]"
                />
              ))}
            </div>

            <p className="font-mono-secondary mt-[16px] text-[19px]">
              <span className="font-bold">146</span>
              <span className="opacity-50"> contributors</span>
            </p>
          </div>

          <div>
            <div className="flex h-[42px] items-center">
              <Image src="/projects/mud/small-brain-games.svg" alt="graph" width="291" height="26" />
            </div>
            <p className="font-mono-secondary mt-[16px] text-[19px]">
              <span className="font-bold">30+</span>
              <span className="opacity-50"> projects</span>
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}

import { Container } from "../../components/ui/Container";
import { Section } from "../../components/ui/Section";
import Image from "next/image";

async function getContributors() {
  const response = await fetch("https://api.github.com/repos/latticexyz/mud/contributors");
  const allContributors = await response.json();

  const userContributors = allContributors
    .filter((contributor: { type: string }) => contributor.type === "User")
    .map((contributor) => {
      const weightedContributions = Math.log(contributor.contributions + 1) * 10;
      const index = Math.random() * weightedContributions;
      const score = weightedContributions - index;
      return {
        ...contributor,
        score,
      };
    })
    .sort((a, b) => b.score - a.score);

  return {
    count: userContributors.length,
    contributors: userContributors.slice(0, 7),
  };
}

export default async function TrustedBy() {
  const { count: contributorsCount, contributors } = await getContributors();
  return (
    <Section className="bg-[#E56A10] border-t border-t-white/20 py-12">
      <Container>
        <div className="flex gap-[22px] items-center">
          <h2 className="text-xl uppercase font-mono">Trusted by many</h2>
          <span className="bg-white/30 w-[1px] h-[50px] inline-block" />
          <p className="text-md">MUD is well established and trusted by leading teams across the industry.</p>
        </div>

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
                  key={contributor.id}
                  src={contributor.avatar_url}
                  alt="frolic"
                  width="35"
                  height="35"
                  className="-ml-2.5 cursor-pointer overflow-hidden rounded-full border-[3px] bg-white border-[#E56A10]"
                />
              ))}
            </div>

            <p className="font-mono-secondary mt-[16px] text-[19px]">
              <span className="font-bold">{contributorsCount}</span>
              <span className="opacity-50"> contributors</span>
            </p>
          </div>

          <div>
            <div className="flex h-[42px] items-center">
              {/* <Image src="/projects/mud/small-brain-games.svg" alt="graph" width="291" height="26" /> */}
              <p className="text-[29px] font-bold uppercase font-mono">Small Brain Games</p>
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

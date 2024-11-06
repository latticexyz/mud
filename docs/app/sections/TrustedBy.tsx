import Image from "next/image";
import { Container } from "../../components/ui/Container";
import { Section } from "../../components/ui/Section";
import { GitHubStars } from "../../components/GitHubStars";

async function getContributors() {
  const response = await fetch("http://localhost:3000/api/contributors");
  const data = await response.json();
  return data;
}

export default async function TrustedBy() {
  const { contributors, count: contributorsCount } = await getContributors();

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

          {/* <div className="grid grid-cols-1 sm:grid-cols-2 sm:grid-rows-2 gap-12 sm:gap-4 w-full"> */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-4 w-full">
            <div>
              <div className="flex w-[173px] h-[42px] items-center text-center justify-center">
                {/* <Image src="/illustrations/github-stars-graph.svg" alt="stars" width="173" height="38" /> */}
                {/* <Graph /> */}

                <GitHubStars />
              </div>
              <p className="font-mono-secondary mt-[16px] text-[19px]">
                {/* <span className="font-bold">GitHub stars</span> */}
                <span className="ml-3 font-light opacity-50">GitHub stars</span>
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

            {/* <div className="sm:col-span-2 sm:row-start-2"> */}
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
        </div>
      </Container>
    </Section>
  );
}

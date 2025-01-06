import Image from "next/image";
import { getContributors } from "../../api/contributors/getContributors";

export default async function Contributors() {
  const { contributors, count: contributorsCount } = await getContributors();
  return (
    <div>
      <div className="flex h-[42px] items-center">
        {contributors.map((contributor) => (
          <Image
            key={contributor.id}
            src={contributor.avatar_url}
            alt="frolic"
            width="35"
            height="35"
            className="-ml-2.5 overflow-hidden rounded-full border-[3px] bg-white border-[#E56A10]"
          />
        ))}
      </div>

      <p className="font-mono-secondary mt-[16px] text-[19px]">
        <span className="font-bold">{contributorsCount}</span>
        <span className="opacity-50"> contributors</span>
      </p>
    </div>
  );
}

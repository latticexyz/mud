import { Octokit } from "octokit";

const octokit = new Octokit();

// TODO: bring back?
// type Stargazer = {
//   timestamp: Date;
//   total: number;
// };

export async function GET() {
  const {
    data: { stargazers_count: totalStars },
  } = await octokit.request("GET /repos/{owner}/{repo}", {
    owner: "latticexyz",
    repo: "mud",
  });

  // TODO: bring back?
  // const totalPages = Math.ceil(totalStars / 100);
  // let allStargazers: Stargazer[] = [];
  // for (let page = 0; page < totalPages; page++) {
  //   const { data: stargazers } = await octokit.request("GET /repos/{owner}/{repo}/stargazers", {
  //     owner: "latticexyz",
  //     repo: "mud",
  //     headers: {
  //       accept: "application/vnd.github.star+json",
  //     },
  //     per_page: 100,
  //     page: page + 1,
  //   });

  //   const stargazersWithTotal = stargazers.map((star, index) => ({
  //     timestamp: new Date(star.starred_at),
  //     total: allStargazers.length + index + 1,
  //   }));

  //   allStargazers = [...allStargazers, ...stargazersWithTotal];
  // }

  return Response.json(totalStars);
}

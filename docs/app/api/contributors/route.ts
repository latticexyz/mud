import { Octokit } from "octokit";

const octokit = new Octokit();

export async function GET() {
  try {
    const response = await octokit.request("GET /repos/{owner}/{repo}/contributors", {
      owner: "latticexyz",
      repo: "mud",
      per_page: 1000,
    });

    const allContributors = response.data;
    if (!Array.isArray(allContributors)) {
      return Response.json({
        count: 0,
        contributors: [],
      });
    }

    const userContributors = allContributors
      ?.filter((contributor: { type: string }) => contributor.type === "User")
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

    return Response.json({
      count: userContributors.length,
      contributors: userContributors?.slice(0, 7),
    });
  } catch (error) {
    console.error(error);
    return Response.json({
      count: 0,
      contributors: [],
    });
  }
}

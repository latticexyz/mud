import { Octokit } from "octokit";

const octokit = new Octokit();

export async function GET() {
  try {
    const {
      data: { stargazers_count: totalStars },
    } = await octokit.request("GET /repos/{owner}/{repo}", {
      owner: "latticexyz",
      repo: "mud",
    });

    return Response.json(totalStars);
  } catch (error) {
    console.error(error);
    return Response.json(0);
  }
}

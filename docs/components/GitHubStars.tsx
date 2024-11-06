"use client";

import React from "react";

async function getStargazers() {
  // TODO: get full url
  const response = await fetch("http://localhost:3000/api/stargazers");
  const data = await response.json();
  return data;
}

export async function GitHubStars() {
  const stargazersCount = await getStargazers();
  return (
    <div className="flex items-center gap-4">
      <p className="text-[29px] font-bold uppercase font-mono text-center">{stargazersCount}</p>
      <iframe
        src="https://ghbtns.com/github-btn.html?user=latticexyz&repo=mud&type=star&count=true&size=large"
        frameBorder="0"
        scrolling="0"
        width="70"
        height="30"
        title="GitHub"
      />
    </div>
  );
}

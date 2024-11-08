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
    <div>
      <div className="flex w-[173px] h-[42px] items-center text-center justify-center">
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
      </div>
      <p className="font-mono-secondary mt-[16px] text-[19px]">
        <span className="ml-3 font-light opacity-50">GitHub stars</span>
      </p>
    </div>
  );
}

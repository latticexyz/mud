import React from "react";
import styled from "styled-components";

interface Props {
  spriteWidth: number;
  imgPath: string;
  nFrames: number;
  timePerFrame?: string;
  spriteHeight?: number;
  scale?: number;
}

export const Spritesheet: React.FC<Props> = ({ spriteHeight, spriteWidth, imgPath, nFrames, timePerFrame, scale }) => {
  return (
    <AnimatedImg
      spriteHeight={spriteHeight}
      spriteWidth={spriteWidth}
      imgPath={imgPath}
      nFrames={nFrames}
      timePerFrame={timePerFrame}
      scale={scale}
    />
  );
};

const AnimatedImg = styled.div<Props>`
  height: ${(p) => p.spriteHeight || p.spriteWidth}px;
  width: ${(p) => p.spriteWidth}px;
  transform: scale(${(p) => (p.scale ? p.scale : 2)});
  image-rendering: pixelated; 
  background: url(${(p) => p.imgPath});
  animation: play-${(p) => p.nFrames}-${(p) => p.spriteWidth} ${(p) => p.timePerFrame || "0.4s"} steps(${(p) =>
  p.nFrames}) infinite;
  }
  @keyframes play-${(p) => p.nFrames}-${(p) => p.spriteWidth} {
  100% {
    background-position: -${(p) => p.nFrames * p.spriteWidth}px;
  }
`;

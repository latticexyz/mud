import React from "react";
import styled from "styled-components";

export const LoadingBar: React.FC<{ percentage: number; className?: string }> = ({ percentage, className }) => {
  return (
    <Wrapper className={className}>
      <Inner percentage={percentage} />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  position: relative;
  height: 4px;
  background-color: #2a2a2a;
`;
const Inner = styled.div<{ percentage: number }>`
  height: 100%;
  width: ${(p) => p.percentage}%;
  background-color: #fff;
`;

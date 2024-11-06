"use client";

import { useRef } from "react";

const data = [
  { timestamp: 1609459200000, count: 1 }, // 2021-01-01
  { timestamp: 1609545600000, count: 2 }, // 2021-01-02
  { timestamp: 1609632000000, count: 3 }, // 2021-01-03
  { timestamp: 1612137600000, count: 4 }, // 2021-02-01
  { timestamp: 1612224000000, count: 5 }, // 2021-02-02
  { timestamp: 1614556800000, count: 6 }, // 2021-03-01
  { timestamp: 1617235200000, count: 7 }, // 2021-04-01
  { timestamp: 1617321600000, count: 8 }, // 2021-04-02
  { timestamp: 1619827200000, count: 9 }, // 2021-05-01
  { timestamp: 1619913600000, count: 10 }, // 2021-05-02
  { timestamp: 1620000000000, count: 11 }, // 2021-05-03
  { timestamp: 1622505600000, count: 12 }, // 2021-06-01
  { timestamp: 1622592000000, count: 13 }, // 2021-06-02
];

export function Graph() {
  const svgRef = useRef<SVGSVGElement>(null);
  const dimensions = { width: 173, height: 38 };

  // TODO: make responsi
  // useEffect(() => {
  //   const updateDimensions = () => {
  //     if (svgRef.current) {
  //       const { width } = svgRef.current.getBoundingClientRect();
  //       setDimensions({ width, height: width * 0.5 }); // Set height to 50% of width
  //     }
  //   };

  //   updateDimensions();
  //   window.addEventListener("resize", updateDimensions);
  //   return () => window.removeEventListener("resize", updateDimensions);
  // }, []);

  const margin = { top: 0, right: 0, bottom: 0, left: 0 };
  const chartWidth = dimensions.width - margin.left - margin.right;
  const chartHeight = dimensions.height - margin.top - margin.bottom;

  const xScale = (timestamp: number) =>
    ((timestamp - Math.min(...data.map((d) => d.timestamp))) /
      (Math.max(...data.map((d) => d.timestamp)) - Math.min(...data.map((d) => d.timestamp)))) *
    chartWidth;

  const yScale = (count: number) =>
    chartHeight -
    ((count - Math.min(...data.map((d) => d.count))) /
      (Math.max(...data.map((d) => d.count)) - Math.min(...data.map((d) => d.count)))) *
      chartHeight;

  const points = data.map((d) => ({
    x: xScale(d.timestamp),
    y: yScale(d.count),
  }));

  const linePath = `M ${points
    .map((p, i) => {
      if (i === 0) return `${p.x},${p.y}`;
      const prev = points[i - 1];
      const cx = (prev.x + p.x) / 2;
      return `S ${cx},${prev.y} ${p.x},${p.y}`;
    })
    .join(" ")}`;

  return (
    <svg
      ref={svgRef}
      width="100%"
      height={dimensions.height}
      viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
      preserveAspectRatio="xMidYMid meet"
      className="overflow-visible"
    >
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(0, 0, 0, 0.1)" />
          <stop offset="100%" stopColor="rgba(0, 0, 0, 1)" />
        </linearGradient>
      </defs>
      <g transform={`translate(${margin.left},${margin.top})`}>
        <path
          d={linePath}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

export default function config() {
  const worldAddress = process.env.NEXT_PUBLIC_WORLD_ADDRESS;

  /**
   * @type {import('next').NextConfig}
   */
  const nextConfig = {
    output: "standalone",
    webpack: (config) => {
      config.externals.push("pino-pretty", "lokijs", "encoding");
      return config;
    },
    async redirects() {
      return [
        {
          source: "/",
          destination: worldAddress ? `/worlds/${worldAddress}/explorer` : "/worlds",
          permanent: false,
        },
        ...(worldAddress
          ? [
              {
                source: "/worlds/:id?",
                destination: `/worlds/${worldAddress}/explorer`,
                permanent: false,
              },
            ]
          : []),
      ];
    },
  };

  return nextConfig;
}

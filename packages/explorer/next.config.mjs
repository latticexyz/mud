export default function config() {
  /**
   * @type {import('next').NextConfig}
   */
  const nextConfig = {
    output: "standalone",
    webpack: (config) => {
      config.externals.push("pino-pretty", "lokijs", "encoding");
      config.resolve.fallback = { fs: false };
      return config;
    },
    redirects: async () => {
      return [
        {
          source: "/worlds/:path*",
          destination: "/anvil/worlds/:path*",
          permanent: false,
        },
        {
          source: "/:chainName/worlds/:worldAddress/explorer",
          destination: "/:chainName/worlds/:worldAddress/explore",
          permanent: false,
        },
      ];
    },
  };

  return nextConfig;
}

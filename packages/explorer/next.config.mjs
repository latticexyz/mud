export default function config() {
  /**
   * @type {import('next').NextConfig}
   */
  const nextConfig = {
    output: "standalone",
    webpack: (config) => {
      config.externals.push("pino-pretty", "lokijs", "encoding");
      return config;
    },
    redirects: async () => {
      return [
        {
          source: "/:chainName/worlds/:worldAddress/explorer",
          destination: "/:chainName/worlds/:worldAddress/explore",
          permanent: true,
        },
      ];
    },
  };

  return nextConfig;
}

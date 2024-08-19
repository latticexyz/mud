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
  };

  return nextConfig;
}

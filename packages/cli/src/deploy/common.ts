import deterministicDeployer from "./deterministic-deployment-proxy/deployment.json";

export const deployer = `0x${deterministicDeployer.address}` as const;

import * as execa from 'execa';

/**
 * Wrapper for execa that logs the full command.
 * @param command - The program/script to execute.
 * @param options - Arguments to pass to `command` on execution.
 * @returns A [`child_process` instance](https://nodejs.org/api/child_process.html#child_process_class_childprocess), which is enhanced to also be a `Promise` for a result `Object` with `stdout` and `stderr` properties.
 */
declare function execLog(command: string, options: string[]): execa.ExecaChildProcess<string>;

declare const IDregex: RegExp;
declare function extractIdFromFile(path: string): string | null;
declare function keccak256(data: string): string;

/**
 * Generate LibDeploy.sol from deploy.json
 * @param configPath path to deploy.json
 * @param out output directory for LibDeploy.sol
 * @param systems optional, only generate deploy code for the given systems
 * @returns path to generated LibDeploy.sol
 */
declare function generateLibDeploy(configPath: string, out: string, systems?: string | string[]): Promise<string>;
declare function resetLibDeploy(out: string): Promise<void>;

/**
 * Deploy world, components and systems from deploy.json
 * @param deployerPrivateKey private key of deployer
 * @param rpc rpc url
 * @param worldAddress optional, address of existing world
 * @param reuseComponents optional, reuse existing components
 * @returns address of deployed world
 */
declare function deploy(deployerPrivateKey?: string, rpc?: string, worldAddress?: string, reuseComponents?: boolean, gasPrice?: number): Promise<{
    child: execa.ExecaReturnValue<string>;
    deployedWorldAddress: string;
    initialBlockNumber: string;
}>;
type DeployOptions = {
    config: string;
    deployerPrivateKey?: string;
    worldAddress?: string;
    rpc: string;
    systems?: string | string[];
    reuseComponents?: boolean;
    clear?: boolean;
    gasPrice?: number;
};
declare function generateAndDeploy(args: DeployOptions): Promise<{
    deployedWorldAddress: string;
    initialBlockNumber: string;
}>;

declare function hsr(root: string, replaceSystems: (systems: string[]) => Promise<unknown>): void;

declare function findLog(deployLogLines: string[], log: string): string;

declare function generateAbiTypes(inputDir: string, outputDir: string, options?: {
    clear?: boolean;
    cwd?: string;
}): Promise<void>;
declare function generateSystemTypes(outputDir: string, options?: {
    clear?: boolean;
}): Promise<void>;
/**
 * @param abiDir If not provided, the contracts are built and abis are exported to ./abi
 */
declare function generateTypes(abiDir?: string, outputDir?: string, options?: {
    clear?: boolean;
}): Promise<void>;

declare function forgeBuild(options?: {
    clear?: boolean;
}): Promise<string>;
declare function filterAbi(abiIn?: string, abiOut?: string, exclude?: string[]): void;

export { DeployOptions, IDregex, deploy, execLog, extractIdFromFile, filterAbi, findLog, forgeBuild, generateAbiTypes, generateAndDeploy, generateLibDeploy, generateSystemTypes, generateTypes, hsr, keccak256, resetLibDeploy };

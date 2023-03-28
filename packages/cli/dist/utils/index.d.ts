import { ZodError, z } from 'zod';
import { ValidationError } from 'zod-validation-error';
import { MUDConfig } from '../config/index.js';
import '@latticexyz/schema-type';

declare function fromZodErrorCustom(error: ZodError, prefix: string): ValidationError;
declare class NotInsideProjectError extends Error {
    name: string;
    message: string;
}
declare class NotESMConfigError extends Error {
    name: string;
    message: string;
}
declare class MUDError extends Error {
    name: string;
}
declare function UnrecognizedSystemErrorFactory(path: string[], systemName: string): z.ZodError<any>;
declare function logError(error: unknown): void;

interface ForgeConfig {
    src: string;
    test: string;
    script: string;
    out: string;
    libs: string[];
    eth_rpc_url: string | null;
    [key: string]: unknown;
}
/**
 * Get forge config as a parsed json object.
 */
declare function getForgeConfig(profile?: string): Promise<ForgeConfig>;
/**
 * Get the value of "src" from forge config.
 * The path to the contract sources relative to the root of the project.
 */
declare function getSrcDirectory(profile?: string): Promise<string>;
/**
 * Get the value of "script" from forge config.
 * The path to the contract sources relative to the root of the project.
 */
declare function getScriptDirectory(profile?: string): Promise<string>;
/**
 * Get the value of "test" from forge config.
 * The path to the test contract sources relative to the root of the project.
 */
declare function getTestDirectory(profile?: string): Promise<string>;
/**
 * Get the value of "out" from forge config.
 * The path to put contract artifacts in, relative to the root of the project.
 */
declare function getOutDirectory(profile?: string): Promise<string>;
/**
 * Get the value of "eth_rpc_url" from forge config, default to "http://127.0.0.1:8545"
 * @param profile The foundry profile to use
 * @returns The rpc url
 */
declare function getRpcUrl(profile?: string): Promise<string>;
/**
 * Execute a forge command
 * @param args The arguments to pass to forge
 * @param options { profile?: The foundry profile to use; silent?: If true, nothing will be logged to the console }
 */
declare function forge(args: string[], options?: {
    profile?: string;
    silent?: boolean;
}): Promise<void>;
/**
 * Execute a cast command
 * @param args The arguments to pass to cast
 * @returns Stdout of the command
 */
declare function cast(args: string[], options?: {
    profile?: string;
}): Promise<string>;

declare function formatSolidity(content: string, prettierConfigPath?: string): Promise<string>;

interface DeployConfig {
    profile?: string;
    rpc: string;
    privateKey: string;
    priorityFeeMultiplier: number;
    debug?: boolean;
}
interface DeploymentInfo {
    blockNumber: number;
    worldAddress: string;
}
declare function deploy(mudConfig: MUDConfig, deployConfig: DeployConfig): Promise<DeploymentInfo>;

export { DeployConfig, DeploymentInfo, ForgeConfig, MUDError, NotESMConfigError, NotInsideProjectError, UnrecognizedSystemErrorFactory, cast, deploy, forge, formatSolidity, fromZodErrorCustom, getForgeConfig, getOutDirectory, getRpcUrl, getScriptDirectory, getSrcDirectory, getTestDirectory, logError };

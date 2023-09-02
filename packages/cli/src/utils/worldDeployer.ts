import { existsSync } from "fs";
import chalk from "chalk";
import path from "path";
import { Contract, ethers } from "ethers";
import { TransactionReceipt, TransactionResponse } from "@ethersproject/providers";
import { encodeSchema } from "@latticexyz/schema-type/deprecated";
import { StoreConfig } from "@latticexyz/store";
import { resolveAbiOrUserType } from "@latticexyz/store/codegen";
import { WorldConfig } from "@latticexyz/world";
import { IBaseWorld } from "@latticexyz/world/types/ethers-contracts/IBaseWorld";
import { getScriptDirectory, forge } from "@latticexyz/common/foundry";
import WorldData from "@latticexyz/world/abi/World.sol/World.json" assert { type: "json" };
import IBaseWorldData from "@latticexyz/world/abi/IBaseWorld.sol/IBaseWorld.json" assert { type: "json" };
import { tableIdToHex } from "@latticexyz/common";
import { CoreModule } from "./coreModules";
import { Systems, SystemsConfig } from "./systems";
import { Modules, ModuleConfig } from "./modules";
import { TxHelper } from "./txHelper";

export type TableIds = { [tableName: string]: Uint8Array };

export class WorldDeployer {
  private worldPromise: Promise<string> | undefined;
  private _worldAddress: string | undefined;
  private _worldContract: Contract | undefined;
  coreModule: CoreModule;
  isCoreModuleInstalled = false;
  systems: Systems;
  modules: Modules;
  confirmations: number;
  tableIds: TableIds = {};

  constructor(
    private config: {
      worldAddress: string | undefined;
      txHelper: TxHelper;
      disableTxWait: boolean;
      mudConfig: StoreConfig & WorldConfig;
      systems: SystemsConfig;
      modules: ModuleConfig;
      forgeOutDirectory: string;
      rpc: string;
      profile: string | undefined;
    }
  ) {
    this.confirmations = this.config.disableTxWait ? 0 : 1;
    this.coreModule = new CoreModule(this.config);
    this.systems = new Systems({ ...this.config, namespace: this.config.mudConfig.namespace });
    this.modules = new Modules(this.config);
    // If an existing World is passed assume its coreModule is already installed
    if (config.worldAddress) this.isCoreModuleInstalled = true;
  }

  get worldContract(): Contract {
    if (!this._worldContract) throw Error("No World Contract");
    return this._worldContract;
  }

  get worldAddress(): string {
    if (!this._worldAddress) throw Error("No World Address");
    return this._worldAddress;
  }

  async deployContracts() {
    this.worldPromise = this.deployWorldContract();
    this.coreModule.deployContracts();
    this.systems.deployContracts();
    this.modules.deployContracts();
  }

  async deployWorldContract() {
    console.log(chalk.blue(`Deploying World`));
    /* 
    Config allows:
    - existing worldAddress to be passed
    - world contract name to be passed
    Or deploy from base contract by default
    (Will also check create2 deployment here in future)
    */
    return this.config.worldAddress
      ? Promise.resolve(this.config.worldAddress)
      : this.config.mudConfig.worldContractName
      ? this.config.txHelper.deployContractByName(this.config.mudConfig.worldContractName, this.config.disableTxWait)
      : this.config.txHelper.deployContract(IBaseWorldData.abi, WorldData.bytecode, this.config.disableTxWait, "World");
  }

  async initialise() {
    // Blocking - Need World to be deployed so we can set address
    if (!this.worldPromise) throw new Error("World must be deployed");
    this._worldAddress = await this.worldPromise;
    // Create World contract instance from deployed address
    this._worldContract = new ethers.Contract(this.worldAddress, IBaseWorldData.abi) as IBaseWorld;
    await this.installCoreModule();
    await this.registerNamesSpace();
    await this.registerTables(this.config.mudConfig, this.config.mudConfig.namespace);
  }

  async installCoreModule() {
    // Only install if not already installed
    if (this.isCoreModuleInstalled) return;
    // Install CoreModule. Blocking to ensure installed.
    await this.coreModule.install(this.worldContract);
    this.isCoreModuleInstalled = true;
  }

  async registerNamesSpace() {
    // Register namespace
    if (this.config.mudConfig.namespace)
      await this.config.txHelper.fastTxExecute(
        this.worldContract,
        "registerNamespace",
        [this.toBytes16(this.config.mudConfig.namespace)],
        this.confirmations
      );
  }

  async registerSystems() {
    await this.systems.registerSystems(this.worldContract);
  }

  async grantAccessSystems() {
    await this.systems.grantAccess(this.worldContract);
  }

  async installModules() {
    await this.modules.install(this.worldContract, this.tableIds);
  }

  async postDeploy(): Promise<void> {
    // Execute postDeploy forge script
    const postDeployPath = path.join(await getScriptDirectory(), this.config.mudConfig.postDeployScript + ".s.sol");
    if (existsSync(postDeployPath)) {
      console.log(chalk.blue(`Executing post deploy script at ${postDeployPath}`));
      await forge(
        [
          "script",
          this.config.mudConfig.postDeployScript,
          "--sig",
          "run(address)",
          this.worldAddress,
          "--broadcast",
          "--rpc-url",
          this.config.rpc,
          "-vvv",
        ],
        {
          profile: this.config.profile,
        }
      );
    } else {
      console.log(`No script at ${postDeployPath}, skipping post deploy hook`);
    }
  }

  async registerTables(mudConfig: StoreConfig & WorldConfig, namespace: string) {
    console.log(chalk.blue("Registering Tables"));
    // Register tables
    const tablePromises: Promise<TransactionResponse | TransactionReceipt>[] = [];
    for (const [tableName, { name, schema, keySchema }] of Object.entries(mudConfig.tables)) {
      console.log(chalk.blue(`Registering table ${tableName} at ${namespace}/${name}`));

      // Store the tableId for later use
      this.tableIds[tableName] = this.toResourceSelector(namespace, name);

      // Register table
      const schemaTypes = Object.values(schema).map((abiOrUserType) => {
        const { schemaType } = resolveAbiOrUserType(abiOrUserType, mudConfig);
        return schemaType;
      });

      const keyTypes = Object.values(keySchema).map((abiOrUserType) => {
        const { schemaType } = resolveAbiOrUserType(abiOrUserType, mudConfig);
        return schemaType;
      });

      tablePromises.push(
        this.config.txHelper.fastTxExecute(
          this.worldContract,
          "registerTable",
          [
            tableIdToHex(namespace, name),
            encodeSchema(keyTypes),
            encodeSchema(schemaTypes),
            Object.keys(keySchema),
            Object.keys(schema),
          ],
          this.confirmations
        )
      );
    }
    await Promise.all(tablePromises);
    console.log(chalk.green(`Tables Registered`));
  }
  // TODO: use TableId from utils as soon as utils are usable inside cli
  // (see https://github.com/latticexyz/mud/issues/499)
  toResourceSelector(namespace: string, file: string): Uint8Array {
    const namespaceBytes = this.toBytes16(namespace);
    const fileBytes = this.toBytes16(file);
    const result = new Uint8Array(32);
    result.set(namespaceBytes);
    result.set(fileBytes, 16);
    return result;
  }

  // TODO: use stringToBytes16 from utils as soon as utils are usable inside cli
  // (see https://github.com/latticexyz/mud/issues/499)
  toBytes16(input: string) {
    if (input.length > 16) throw new Error("String does not fit into 16 bytes");

    const result = new Uint8Array(16);
    // Set ascii bytes
    for (let i = 0; i < input.length; i++) {
      result[i] = input.charCodeAt(i);
    }
    // Set the remaining bytes to 0
    for (let i = input.length; i < 16; i++) {
      result[i] = 0;
    }
    return result;
  }
}

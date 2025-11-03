import type { Chain } from 'viem';

type CompileContext = {
  args: string[];
};

type DeployContext = {
  chain: string;
  contracts: string[];
  args: any[];
};

type RunContext = {
  chain: string;
  script: string;
  args: any[];
};

type ForkContext = {
  chain: string;
  rpcUrl: string;
  pid: number;
};

export type Plugin = {
  name?: string;

  extendConfig?: (config: Config) => Partial<Config> | void;

  onCompile?: (ctx: CompileContext, config: Config) => Promise<void> | void;
  onBeforeCompile?: (ctx: CompileContext, config: Config) => Promise<boolean> | boolean;
  onDeploy?: (ctx: DeployContext, config: Config) => Promise<void> | void;
  onBeforeDeploy?: (ctx: DeployContext, config: Config) => Promise<boolean> | boolean;
  onRun?: (ctx: RunContext, config: Config) => Promise<void> | void;
  onBeforeRun?: (ctx: RunContext, config: Config) => Promise<boolean> | boolean;
  onFork?: (ctx: ForkContext, config: Config) => Promise<void> | void;
}

export type PartialChain = Partial<Chain>;
export type ExtendedChain = PartialChain & {
  fork?: {
    chainId?: number;
    port?: number;
    blockNumber?: number;
    blockTime?: number;
    deploy?: Array<SolRef | string>;
    onFork?: Array<SolRef | string>;
    onDeploy?: Array<SolRef | string>;
  };
  deploy?: Array<SolRef | string>;
  onDeploy?: Array<SolRef | string>;
}

export type SolRef<A extends readonly unknown[] = readonly unknown[]> = {
  name?: string;
  src: string;
  args?: A;
};

export type WithArgs<A> = { args: A };

export type Hex = `0x${string}` & { readonly __brand: unique symbol };

export interface Config {
  wallet?: string | Hex;
  paths?: {
    src?: string;
    out?: string;
    scripts?: string;
    deployed?: string | string[];
    vibe?: string;
    keystores?: string;
  };
  contracts?: Record<string, SolRef>;
  scripts?: Record<string, SolRef>;
  chains?: Record<string, ExtendedChain>;
  optimizer?: {
    enabled?: boolean;
    runs?: number;
  };
  verbosity?: number;
  via_ir?: boolean;
  plugins?: string[];
}
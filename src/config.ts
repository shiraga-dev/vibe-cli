import type { Config, ExtendedChain } from './types';

export default <Config> {
  privateKey: "",
  paths: {
    src: 'src',
    out: 'out',
    scripts: 'script',
    deployed: 'deployed',
    vibe: 'vibe',
  },
  chains: {
    ...(await import('viem/chains')).default,
  } as { [key: string]: ExtendedChain },
  fork: {
    privateKey: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
  },
  optimizer: {
    enabled: true,
    runs: 200,
  },
  verbosity: 4,
  via_ir: true,
};
import type { Config, ExtendedChain } from 'vibe-core';

export default {
  paths: {
    src: 'src',
    out: 'out',
    scripts: 'script',
    deployed: 'deployed',
    vibe: 'vibe',
    keystores: './keystores',
  },
  chains: {
    ...(await import('viem/chains')).default,
  } as { [key: string]: ExtendedChain },
  optimizer: {
    enabled: true,
    runs: 200,
  },
  verbosity: 4,
  via_ir: true,
} satisfies Config;
#!/usr/bin/env node

import type { Config, ExtendedChain } from './types';

export default <Config> {
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
};
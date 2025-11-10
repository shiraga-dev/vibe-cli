#!/usr/bin/env node

import { mergeConfig, verbosity, optimizer, via_ir } from './util.ts'
import { execSync } from 'child_process'

export async function main() {
  const config = await mergeConfig()
  let rpcUrl = '';

  const args = process.argv.slice(3);
  for (let i = 0; i < args.length; i++) {
    if ((args[i] === '--chain' || args[i] === '-c') && args[i + 1]) {
      rpcUrl = `--fork-url ${(config.chains || {})[args[i + 1] as keyof typeof config.chains]?.rpcUrls?.default.http[0]}`;
      break;
    }
  }
  
  try {
    execSync(`forge test ${rpcUrl} ${verbosity(config)} ${optimizer(config)} ${via_ir(config)} ${args.join(' ')}`, { stdio: 'inherit' });
  } catch (error) {
    console.error('Failed to run tests: ', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('❌ Error during check:', error);
    process.exit(1);
  });
}
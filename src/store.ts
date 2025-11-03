import { execSync } from 'child_process';
import { mergeConfig } from "./util";
import { argv } from 'bun';

const config = await mergeConfig()

let name = process.argv[3];
let options = process.argv.slice(4);

export async function main() {
  try {
    if (!name) {
      throw new Error('Please provide a name for the keystore.');
    }
    if (!options.includes('--private-key') && !options.includes('--mnemonic') && !options.includes('--mnemonic-passphrase')) {
      throw new Error('Please provide either --private-key or --mnemonic/--mnemonic-passphrase to generate the keystore.');
    }

    const path = config.paths?.keystores;
    execSync(`cast wallet import ${options.join(' ')} -k ${path} ${name}`, { stdio: 'inherit' });
  }
  catch (error) {
    console.error('Failed to generate keystore: ', error);
    process.exit(1);
  }
}
import { mergeConfig, optimizer, via_ir } from "./util";
import { execSync } from 'child_process'

const config = await mergeConfig()

export async function main() {
  try {
    const args = process.argv.slice(3);
    execSync(`forge build --sizes ${optimizer(config)} ${via_ir(config)} ${args.join(' ')}`, { stdio: 'inherit' });
    await (await import("./generateTypes")).main();
  } catch (error) {
    console.error('Failed to build forge project: ', error);
    process.exit(1);
  }
}
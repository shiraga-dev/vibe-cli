import foundry from "./src/foundry";

export { type Config, type ExtendedChain, type SolRef, type Plugin } from "./src/types";
export { defineConfig, definePlugin, mergeConfig, curl } from "./src/util";

const cmd = process.argv[2]

async function main() {
  await foundry();

  switch (cmd) {
    case "init":
      await (await import("./src/init")).main();
      break;
    case "store":
      await (await import("./src/store")).main();
      break;
    case "compile":
      await (await import("./src/compile")).main();
      break;
    case "generate":
      await (await import("./src/generateTypes")).main();
      break;
    case "check":
      await (await import("./src/check")).main();
      break;
    case "curl":
      await (await import("./src/curl")).main();
      break;
  }
}

main();
#!/usr/bin/env node

import foundry from "./src/foundry.ts";

export { mergeConfig, curl } from "./src/util.ts";

const cmd = process.argv[2]

async function main() {

  switch (cmd) {
    case "init":
      await foundry();
      await (await import("./src/init.ts")).main();
      break;
    case "store":
      await foundry();
      await (await import("./src/store.ts")).main();
      break;
    case "compile":
      await foundry();
      await (await import("./src/compile.ts")).main();
      break;
    case "generate":
      await (await import("./src/generateTypes.ts")).main();
      break;
    case "check":
      await foundry();
      await (await import("./src/check.ts")).main();
      break;
    case "curl":
      await (await import("./src/curl.ts")).main();
      break;
  }
}

main();
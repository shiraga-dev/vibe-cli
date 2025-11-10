import { type Config } from "vibe-core"

export default {
  contracts: {
    Counter: {
      src: "Counter",
    },
  },
  scripts: {
    Increment: { src: "Counter" },
    Decrement: { src: "Counter" },
    Add: { src: "Counter" },
    Subtract: { src: "Counter" },
  },
  chains: {
    base: {
      fork: {
        deploy: ["Counter"],
      },
      deploy: ["Counter"],
    },
  },
} satisfies Config;
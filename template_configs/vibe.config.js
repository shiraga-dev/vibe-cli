export default {
  contracts: {
    Counter: {
      src: "Counter",
    },
  },
  chains: {
    base: {
      id: 8453,
      fork: {
        deploy: ["Counter"],
      },
      deploy: [
        { name: "Counter", src: "Counter", args: [] },
      ]
    },
  },
  scripts: {
    Increment: { src: "Counter" },
    Decrement: { src: "Counter" }
  },
}
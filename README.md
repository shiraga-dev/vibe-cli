# vibe-cli

A CLI tool/wrapper around [Foundry](https://book.getfoundry.sh/) for TypeScript/JavaScript developers that supercharges your dApp workflow.

vibe-cli allows you to:
* Compile, test, deploy and verify smart-contracts across various chains. 
* Manage and orchestrate forked chain environments with ease.
* Run Solidity scripts manually or automatically before deployment, after deployment etc.
* Easily extend with custom plugins.

Foundry does not have to be installed to start using vibe-cli. If Foundry is not found, vibe-cli will ask if you'd like it to install it for you.

This CLI works on bash, Powershell and CMD.

> [!NOTE]
> vibe-cli is currently a work in progress. Expect missing features and bugs.

## Production Roadmap
- ✅ Initialization 
- ✅ Compilation
- ✅ Type generation
- ✅ Linux support
- 🚧 Forking
- 🚧 Deploying
- 🚧 Funding
- 🚧 Running scripts
- 🚧 Snapshots
- 🚧 Replays
- 🚧 Verification

## Installation

<table>
  <tr>
    <td>npm</td>
    <td><code>npm install -g vibe-cli</code></td>
  </tr>
  <tr>
    <td>Yarn</td>
    <td><code>yarn add -g vibe-cli</code></td>
  </tr>
  <tr>
    <td>pnpm</td>
    <td><code>pnpm add -g vibe-cli</code></td>
  </tr>
  <tr>
    <td>Bun</td>
    <td><code>bun add -g vibe-cli</code></td>
  </tr>
</table>

## Usage

### Initialising / adding Vibe-CLI to a project

```bash
vibe init [name]
```

This will either add vibe to an existing NodeJS/Bun project, or create a new vibe project.

Not providing a name will run the command in the current working directory.

When adding vibe to an existing project, the use of Typescript will be detected and `vibe.config.ts` will be generated instead of `vibe.config.js`, enabling type-safety in the configuration file.

### Compiling contracts

```bash
vibe compile
```

This command will compile the contracts and scripts specified in the `vibe.config.ts/js` file in your project. Types for these contracts will be automatically generated, including constructor and function parameters, which can then be used across the project.
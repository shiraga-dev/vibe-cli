import type { Chain } from 'viem';
import defaultConfig from './config'
import { spawn } from 'child_process';
import type { Config, ExtendedChain, Plugin } from './types';
import { resolve } from 'path';
import { pathToFileURL } from 'url';

export const defineConfig = <T extends Config>(config: T): T => {
  return config;
}

export function definePlugin(plugin: Plugin): Plugin {
  return plugin;
}

export async function mergeConfig(): Promise<Config> {
  try {
    const fileName = "vibe.config"
    const path = resolve(process.cwd(), fileName)
    const userConfig = await import(pathToFileURL(path).href).then(mod => mod.default)
    let config = {
      wallet: userConfig.wallet,
      paths: {
        src: userConfig.paths?.src ?? defaultConfig.paths?.src,
        out: userConfig.paths?.out ?? defaultConfig.paths?.out,
        scripts: userConfig.paths?.scripts ?? defaultConfig.paths?.scripts,
        deployed: userConfig.paths?.deployed ?? defaultConfig.paths?.deployed,
        vibe: userConfig.paths?.vibe ?? defaultConfig.paths?.vibe,
        keystores: userConfig.paths?.keystores ?? defaultConfig.paths?.keystores,
      },
      contracts: userConfig.contracts ?? {},
      scripts: userConfig.scripts ?? {},
      chains: {} as { [key: string]: ExtendedChain },
      optimizer: userConfig.optimizer ?? defaultConfig.optimizer,
      verbosity: userConfig.verbosity ?? defaultConfig.verbosity,
      via_ir: userConfig.via_ir ?? defaultConfig.via_ir
    }

    Object.keys(defaultConfig.chains ?? {}).forEach((c) => {
      if (userConfig.chains === undefined) userConfig.chains = {}
      let userChain = userConfig.chains != undefined && Object.keys(userConfig.chains).includes(c) ? userConfig.chains[c] : null
      let defaultChain = defaultConfig.chains ? defaultConfig.chains[c as keyof typeof defaultConfig.chains] : null
      if (userChain) userConfig.chains[c] = { ...defaultChain, ...userChain }
      else if (defaultChain) config.chains[c] = defaultChain
    })

    return config;

  } catch (e) {
    console.error(`Failed to load config: ${e}`)
    process.exit(1);
  }
}

export async function curl(chainKey: string, method: string, params: any[]) {
  return new Promise(async (resolve, reject) => {
    const config = await mergeConfig()
    const curl = spawn('curl', [
      '-H', 'Content-Type: application/json',
      '-d', `{"id":1, "jsonrpc":"2.0", "method":"${method}", "params":[${params}]}`,
      '--silent', '--write-out', 'Downloaded %{size_download} bytes in %{time_total} seconds\n',
      'http://localhost:' + (config.chains || {})[chainKey]?.fork?.port
    ])
    
    curl.stdout.on('data', (data) => {
      console.log(data.toString())
    })
    
    curl.stderr.on('data', (data) => {
      console.error(data.toString())
    })
    
    curl.on('close', (code) => {
      if (code === 0) {
        resolve(`Curl command executed successfully`);
      } else {
        reject(new Error(`Curl command failed with code ${code}`))
      }
    })
  }).catch((error) => {
    console.error(error.stack || error.message || error.toString());
    process.exit(1);
  });
}

export function optimizer(config: Config): string {
  let optimizer = ''
  if (config.optimizer?.enabled) {
    optimizer = '--optimize'
    if (config.optimizer.runs) {
      optimizer += ` --optimizer-runs ${config.optimizer.runs}`
    }
  }
  return optimizer
}

export function verbosity(config: Config): string {
  let verbosity = ''
  if (config.verbosity) {
    verbosity = '-'
    for (let i = 0; i < config.verbosity; i++) {
      verbosity += 'v'
    }
  }
  return verbosity
}

export function via_ir(config: Config): string {
  return config.via_ir ? '--via-ir' : ''
}
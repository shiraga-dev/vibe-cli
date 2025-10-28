import { mergeConfig } from './util'
import { readFileSync } from 'fs';
import type { Abi } from 'abitype'

export async function main() {
  const config = await mergeConfig()
  let output = `import type { AbiParameterToPrimitiveType } from "abitype";\n\n`

  let constructorArgs = `export type ConstructorArgs<Contract> = {\n`
  let functionArgs = `export type FunctionArgs<Contract, Function> = {\n`
  if (config.contracts) Object.entries(config.contracts).forEach(([name]) => {
    const path = `${config.paths?.out}/${name}.sol/${name}.json`
    try {
      const json = JSON.parse(readFileSync(path, 'utf8'))
      const abi = json.abi as Abi

      constructorArgs += `  ${name}: [\n`
      const constructor = abi.find((item) => item.type === 'constructor');
      if (constructor) constructor.inputs.map((input, index) => input.name || `arg${index}`).forEach((paramName, index) => {
        const param = constructor.inputs[index];
        constructorArgs += `    ${paramName}: AbiParameterToPrimitiveType<${JSON.stringify(param)}>,\n`
      })
      constructorArgs += `  ]\n`
      
      functionArgs += `  ${name}: {\n`
      abi.filter(item => item.type === 'function').forEach(fn => {
        functionArgs += `    ${fn.name}: [\n`
        fn.inputs.map((input, index) => input.name || `arg${index}`).forEach((paramName, index) => {
          const param = fn.inputs[index];
          functionArgs += `      ${paramName}: AbiParameterToPrimitiveType<${JSON.stringify(param)}>,\n`
        })
        functionArgs += `    ],\n`
      })
      functionArgs += `  }\n`
    } catch (e) {
      console.error(`Failed to read contract artifact for ${name} at ${path}: ${e}`);
      process.exit(1);
    }
  })
  constructorArgs += `}[Contract]\n\n`
  functionArgs += `}[Contract][Function]\n\n`

  let scriptArgs = `export type ScriptArgs<Script> = {\n`
  if (config.scripts) Object.entries(config.scripts).forEach(([name, solRef]) => {
    const path = `${config.paths?.out}/${solRef.src}.s.sol/${name}.json`
    try {
      const json = JSON.parse(readFileSync(path, 'utf8'))
      const abi = json.abi as Abi

      scriptArgs += `  ${name}: [\n`
      const run = abi.filter(item => item.type === 'function').find(item => item.name === 'args')
      if (run) {
        run.inputs.map((input, index) => input.name || `arg${index}`).forEach((paramName, index) => {
          scriptArgs += `    ${paramName}: AbiParameterToPrimitiveType<${JSON.stringify(run.inputs[index])}>,\n`
        })
      }
      scriptArgs += `  ]\n`
    } catch (e) {
      console.error(`Failed to read script artifact for ${name} at ${path}: ${e}`);
      process.exit(1);
    }
  })
  scriptArgs += `}[Script]`

  const outPath = `${config.paths?.vibe}/types.d.ts`
  require('fs').writeFileSync(outPath, output + constructorArgs + functionArgs + scriptArgs);
  console.log(`Generated types written to ${outPath}`);
}
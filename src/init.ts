#!/usr/bin/env node

import inquirer from 'inquirer';
import { existsSync, mkdirSync, readdirSync, statSync, readFileSync, writeFileSync, copyFileSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { createRequire } from "module";

const p = createRequire(import.meta.url)("./package.json");

const CWD = process.cwd();
const __dirname = dirname(fileURLToPath(import.meta.url));

let projectName = process.argv[3];

const createDirectoryContents = (templatePath: string, projectPath: string) => {
  const filesToCreate = readdirSync(templatePath);

  filesToCreate.forEach(file => {
    const origFilePath = `${templatePath}/${file}`
    const stats = statSync(origFilePath)

    if (stats.isFile()) {
      const contents = readFileSync(origFilePath, 'utf8')
      const writePath = `${projectPath}/${file}`
      writeFileSync(writePath, contents, 'utf8')
    } else if (stats.isDirectory()) {
      mkdirSync(`${projectPath}/${file}`)

      createDirectoryContents(`${templatePath}/${file}`, `${projectPath}/${file}`)
    }
  });
};

export async function main() {
  const path = projectName ? `${CWD}/${projectName}` : CWD;

  if (!existsSync(path)) {
    console.error(`❌ Project directory does not exist: ${path}`);
    process.exit(1);
  }

  if (!existsSync(`${path}/package.json`)) {
    console.error(`❌ Project is not initialized: ${path}/package.json does not exist`);
    process.exit(1);
  }

  if (!existsSync(`${path}/.git`)) {
    console.error(`❌ Project is not a Git repository: ${path}/.git does not exist`);
    process.exit(1);
  }

  try {
    const status = execSync("git status --porcelain", {
      cwd: path,
      stdio: ["pipe", "pipe", "ignore"]
    }).toString().trim();

    const isDirty = status.length > 0;
    const isMerging = existsSync(`${path}/.git/MERGE_HEAD`);

    if (isDirty || isMerging) {
      console.error(`❌ Project has uncommitted changes or is in the middle of a merge. Please commit or stash your changes before initializing.`);
      process.exit(1);
    }
  } catch {
    console.warn("⚠️ Unable to determine Git status. Proceeding anyway.");
  }

  if (existsSync(`${path}/.vibe`)) {
    console.log(`✅ Project is already initialized`);
    process.exit(1);
  }

  if (projectName) {
    mkdirSync(`${CWD}/${projectName}`);
  }

  const templatePath = `${__dirname}/../templates`;
  const configsPath = `${__dirname}/../template_configs`;

  createDirectoryContents(templatePath, path);
  
  const configFile = existsSync(`${path}/tsconfig.json`) ? 'vibe.config.ts' : 'vibe.config.js';
  copyFileSync(`${configsPath}/${configFile}`, `${path}/${configFile}`);

  const packageJsonPath = `${path}/package.json`;
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  packageJson.devDependencies = {
    ...packageJson.devDependencies,
    "vibe-cli": `^${p.version}`,
  };
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');

  console.log('Project initialized');

  const { packageManager } = await inquirer.prompt([
    {
      type: 'list',
      name: 'packageManager',
      message: 'Which package manager would you like to use?',
      choices: ['npm', 'yarn', 'pnpm', 'bun'],
      default: 'npm',
    },
  ]);

  execSync(`${packageManager} install`, {
    stdio: 'inherit',
  });

  const gitmodulesPath = `${path}/.gitmodules`;
  const gitmodulesContent = `
    [submodule "lib/forge-std"]
      path = lib/forge-std
      url = https://github.com/foundry-rs/forge-std
    `;
  writeFileSync(gitmodulesPath, gitmodulesContent.trim(), 'utf8');

  if (!existsSync(`${path}/lib/forge-std`)) {
    console.log('🔄 Running forge install...');
    execSync(`forge install`, { stdio: 'inherit', cwd: path });
  }

  const gitignorePath = `${path}/.gitignore`;
  let gitignoreContent = '';
  if (existsSync(gitignorePath)) {
    gitignoreContent = readFileSync(gitignorePath, 'utf8');
  }
  if (!gitignoreContent.includes('./keystores')) {
    gitignoreContent += `\n\n# Ignore keystores\n./keystores\n`;
    writeFileSync(gitignorePath, gitignoreContent, 'utf8');
  }

  console.log('✅ Project setup complete!');
}

main().catch((error) => {
  console.error('❌ Error during project initialization: ', error);
  process.exit(1);
});
#!/usr/bin/env node

import inquirer from 'inquirer';
import { existsSync, mkdirSync, readdirSync, statSync, readFileSync, writeFileSync, copyFileSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

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

  if (existsSync(`${path}/.vibe`)) {
    console.log(`✔ Project is already initialized`);
    process.exit(1);
  }

  if (!existsSync(path)) mkdirSync(path);

  if (!existsSync(`${path}/.git`)) execSync('git init', { cwd: path, stdio: 'inherit' });

  const { packageManager } = await inquirer.prompt([
    {
      type: 'list',
      name: 'packageManager',
      message: 'Which package manager would you like to use?',
      choices: ['npm', 'yarn', 'pnpm', 'bun'],
      default: 'npm',
    },
  ]);

  if (!existsSync(`${path}/package.json`)) execSync(`${packageManager} init -y`, { cwd: path, stdio: 'inherit' });

  const templatePath = `${__dirname}/../template`;
  const configsPath = `${__dirname}/../template_configs`;

  createDirectoryContents(templatePath, path);
  
  const configFile = existsSync(`${path}/tsconfig.json`) ? 'vibe.config.ts' : 'vibe.config.js';
  copyFileSync(`${configsPath}/${configFile}`, `${path}/${configFile}`);

  const packageJsonPath = `${path}/package.json`;
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  packageJson.devDependencies = {
    ...packageJson.devDependencies,
    "vibe-core": "^0.1.12",
  };
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');

  execSync('git submodule add https://github.com/foundry-rs/forge-std lib/forge-std', { cwd: path, stdio: 'inherit' });
  execSync('git submodule add https://github.com/shiraga-dev/vibe-core lib/vibe-core', { cwd: path, stdio: 'inherit' });

  try {
    const status = execSync("git status --porcelain", {
      cwd: path,
      stdio: ["pipe", "pipe", "ignore"]
    }).toString().trim();
    const isMerging = existsSync(`${path}/.git/MERGE_HEAD`);

    if (isMerging) {
      console.error("❌ Cannot initialize project during a merge. Please resolve the merge first.");
      process.exit(1);
    }

    const isDirty = status.length > 0;

    if (isDirty) {
      execSync("git add .", { cwd: path, stdio: 'inherit' });
      execSync('git commit -m "chore: initialize vibe project"', { cwd: path, stdio: 'inherit' });
    }
  } catch {
    console.warn("⚠︎ Unable to determine Git status. Proceeding anyway.");
  }

  if (!existsSync(`${path}/lib/forge-std`)) {
    console.log('⏳ Running "forge install"...');
    execSync(`forge install`, { stdio: 'inherit', cwd: path });
  }

  const gitignorePath = `${path}/.gitignore`;
  let gitignoreContent = '';
  if (existsSync(gitignorePath)) {
    gitignoreContent = readFileSync(gitignorePath, 'utf8');
  }
  if (!gitignoreContent.includes('./keystores')) {
    gitignoreContent += `\n# Keystores\n./keystores\n`;
    writeFileSync(gitignorePath, gitignoreContent, 'utf8');
  }

  execSync(`${packageManager} install`, { cwd: path, stdio: 'inherit' });

  console.log('✔ Project setup complete!');
}
#!/usr/bin/env node

import { execSync } from 'child_process'
import { homedir, tmpdir } from 'os';
import path from 'path';
import { https } from 'follow-redirects';
import { existsSync, mkdirSync, createWriteStream, unlinkSync } from 'fs';
import AdmZip from 'adm-zip';
import inquirer from "inquirer";

const installDir = path.join(homedir(), '.foundry');
const zipUrl = 'https://github.com/foundry-rs/foundry/releases/download/nightly/foundry_nightly_win32_amd64.zip';
const zipPath = path.join(tmpdir(), 'foundry.zip');

function checkFoundry(): boolean {
  try {
    execSync('forge --help', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function download(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode !== 200) return reject(new Error(`Failed to download: ${res.statusCode}`));
      res.pipe(file);
      file.on('finish', () => file.close(() => resolve()));
      file.on('error', err => {
        file.close();
        reject(err);
      });
    }).on('error', reject);
  });
}

function cleanup() {
  try {
    if (existsSync(zipPath)) {
      console.log(`🗑️  Deleting temporary file: ${zipPath}`);
      unlinkSync(zipPath);
    }
  } catch (err) {
    console.error('Error during cleanup:', err);
  }
}

function extractExecutables(zipPath: string, targetDir: string): void {
  const zip = new AdmZip(zipPath);
  const entries = zip.getEntries();

  entries.forEach((entry) => {
    if (entry.entryName.endsWith('.exe')) {
      console.log(`🛠️  Extracting: ${entry.entryName}`);
      zip.extractEntryTo(entry, targetDir, false, true);
    }
  });
}

export default async function (): Promise<boolean> {
  if (checkFoundry()) {
    return true;
  }

  const { install } = await inquirer.prompt([
    {
      name: "install",
      type: "confirm",
      message: "Foundry is not installed. Would you like to install it now?",
      default: true,
    },
  ]);

  if (!install) {
    console.log('❌ Installation aborted.');
    return false;
  }

  if (!existsSync(installDir)) mkdirSync(installDir, { recursive: true });

  console.log('📦 Downloading Foundry...');
  await download(zipUrl, zipPath);

  console.log('📂 Extracting executables...');
  extractExecutables(zipPath, installDir);

  console.log('✅ Foundry installed to:', installDir);

  cleanup();
  
  const currentPath = process.env.PATH || '';
  if (!currentPath.includes(installDir)) {
    process.env.PATH = `${installDir}${path.delimiter}${currentPath}`;
    console.log(`🔧 Updated PATH to include: ${installDir}`);
  }

  try {
    execSync(`forge --version`, { stdio: 'inherit' });
  } catch {
    console.warn('⚠️ Could not run forge. Is the path set?');
    return false;
  }

  return true;
}
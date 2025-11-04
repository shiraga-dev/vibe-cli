#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";

const VIBE_PATH = path.resolve(process.cwd(), ".vibe");

export type Deployment = {
  abi: any[];
  address: `0x${string}`;
};

export type ChainRef = {
  id: number;
  rpcUrl: string;
  deployed: Record<string, `0x${string}`>;
  devAddresses?: `0x${string}`[];
};

export type VibeFile = {
  abis: Record<string, any[]>;
  chains: Record<string, ChainRef>;
};

export function readVibeFile(): VibeFile {
  if (!existsSync(VIBE_PATH)) return { abis: {}, chains: {} };
  const content = readFileSync(VIBE_PATH, "utf8");
  return JSON.parse(content) as VibeFile;
}

export function writeVibeFile(data: VibeFile): void {
  const dir = path.dirname(VIBE_PATH);
  if (!existsSync(dir)) {
    throw new Error(`Directory ${dir} does not exist.`);
  }
  writeFileSync(VIBE_PATH, JSON.stringify(data, null, 2), "utf8");
}

export function getDeployment(contractName: string, chainName: string): Deployment | null {
  const vibeFile = readVibeFile();
  if (!vibeFile.abis || !vibeFile.chains) {
    console.error(`No deployments found in .vibe file.`);
    return null;
  }
  const contractAbi = vibeFile.abis[contractName];
  const contractAddress = vibeFile.chains[chainName]?.deployed[contractName] || null;
  if (!contractAbi || !contractAddress) {
    console.error(`Deployment for ${contractName} on ${chainName} not found.`);
    return null;
  }
  return { abi: contractAbi, address: contractAddress };
}

export function getDevAddresses(chainName: string): `0x${string}`[] {
  const vibeFile = readVibeFile();
  if (!vibeFile.chains || !vibeFile.chains[chainName]) {
    console.error(`Chain ${chainName} does not exist in .vibe file.`);
    return [];
  }
  return vibeFile.chains[chainName].devAddresses || [];
}

export function addDevAddress(chainName: string, address: `0x${string}`): VibeFile {
  const vibeFile = readVibeFile();
  if (!vibeFile.chains) vibeFile.chains = {};
  if (!vibeFile.chains[chainName]) {
    console.error(`Chain ${chainName} does not exist in .vibe file.`);
  } else {
    if (!vibeFile.chains[chainName].devAddresses) {
      vibeFile.chains[chainName].devAddresses = [];
    }
    if (!vibeFile.chains[chainName].devAddresses.includes(address)) {
      vibeFile.chains[chainName].devAddresses.push(address);
      writeVibeFile(vibeFile);
    }
  }
  return vibeFile;
}

export function getChainDeployments(chainName: string): Record<string, Deployment> | null {
  const vibeFile = readVibeFile();
  if (!vibeFile.chains || !vibeFile.chains[chainName]) {
    console.error(`Chain ${chainName} does not exist in .vibe file.`);
    return null;
  }
  const names = Object.keys(vibeFile.chains[chainName].deployed);
  if (names.length === 0) return null;
  const deployments: Record<string, Deployment> = {};
  for (const name of names) {
    const deployment = getDeployment(name, chainName);
    if (deployment) {
      deployments[name] = deployment;
    }
  }
  return Object.keys(deployments).length > 0 ? deployments : null;
}

export function getChainRef(chainName: string): ChainRef | null {
  const vibeFile = readVibeFile();
  if (!vibeFile.chains) {
    console.error(`No chains found in .vibe file.`);
    return null;
  }
  return vibeFile.chains[chainName] || null;
}

export function setChainRef(chainName: string, chainRef: ChainRef): VibeFile {
  const vibeFile = readVibeFile();
  if (!vibeFile.chains) vibeFile.chains = {};
  vibeFile.chains[chainName] = chainRef;
  writeVibeFile(vibeFile);
  return vibeFile;
}

export function setDeploymentAddress(chainName: string, contractName: string, address: `0x${string}`): VibeFile {
  const vibeFile = readVibeFile();
  if (!vibeFile.chains || !vibeFile.chains[chainName]) {
    console.error(`Chain ${chainName} does not exist in .vibe file.`);
    return vibeFile;
  }
  vibeFile.chains[chainName].deployed[contractName] = address;
  writeVibeFile(vibeFile);
  return vibeFile;
}

export function setContractAbi(contractName: string, abi: any[]): VibeFile {
  const vibeFile = readVibeFile();
  if (!vibeFile.abis) vibeFile.abis = {};
  vibeFile.abis[contractName] = abi;
  writeVibeFile(vibeFile);
  return vibeFile;
}

export function removeChainRef(chainName: string): VibeFile {
  const vibeFile = readVibeFile();
  if (!vibeFile.chains || !vibeFile.chains[chainName]) {
    console.error(`Chain ${chainName} does not exist in .vibe file.`);
    return vibeFile;
  }
  delete vibeFile.chains[chainName];
  writeVibeFile(vibeFile);
  return vibeFile;
}

export function removeDeployment(chainName: string, contractName: string): VibeFile {
  const vibeFile = readVibeFile();
  if (!vibeFile.chains || !vibeFile.chains[chainName] || !vibeFile.chains[chainName].deployed) {
    console.error(`Chain ${chainName} or deployment for ${contractName} does not exist in .vibe file.`);
    return vibeFile;
  }
  delete vibeFile.chains[chainName].deployed[contractName];
  writeVibeFile(vibeFile);
  return vibeFile;
}
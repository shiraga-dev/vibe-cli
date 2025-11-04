#!/usr/bin/env node

import { spawn } from 'child_process';

export type Fork = {
  port: number;
  rpcUrl: string;
  pid: number;
  blockNumber: number;
  startedAt: Date;
  kill: () => Promise<void>;
  reset: (blockNumber?: number) => Promise<void>;
}

export type ForkProxy = {
  port: number;
  fork: Fork;
  purgeInterval: NodeJS.Timeout;
}

const networkName = process.argv[3]

export async function main() {
  // Check if the network name is provided
  if (!networkName) {
    console.error('Please provide a network name to fork.');
    process.exit(1);
  }

  // Check if a fork proxy is already running for the given network
  
}

const startFork = () => {

}

const killFork = () => {

}

function startProxy({ proxyPort, targetPort }: { proxyPort: number, targetPort: number })  {

}
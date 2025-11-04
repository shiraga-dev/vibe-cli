#!/usr/bin/env node

import { curl } from './util.js'

const chainKey = process.argv[3] as string
const command = process.argv[4] as string
const args = process.argv.slice(5)

export async function main() {
  await curl(chainKey, command, args)
}
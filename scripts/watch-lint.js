#!/usr/bin/env node

import chokidar from 'chokidar';
import { execSync } from 'child_process';
import { cpus, totalmem } from 'os';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[36m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

const patterns = ['src/**/*.js', 'src/**/*.jsx', 'src/**/*.ts', 'src/**/*.tsx'];

function getVersionInfo() {
  try {
    const pkg = JSON.readFileSync(join(projectRoot, 'package.json'), 'utf-8');
    const deps = JSON.parse(pkg);
    return {
      node: process.version,
      next: deps.dependencies?.next || 'N/A',
      react: deps.dependencies?.react || 'N/A',
    };
  } catch {
    return { node: process.version, next: 'N/A', react: 'N/A' };
  }
}

function clearScreen() {
  process.stdout.write('\x1b[2J\x1b[0f');
}

function printHeader() {
  const version = getVersionInfo();
  const cpuCount = cpus().length;
  const totalMem = (totalmem() / 1024 / 1024 / 1024).toFixed(1);

  console.log(`${BLUE}${BOLD}╔══════════════════════════════════════════════════════════════╗${RESET}`);
  console.log(`${BLUE}${BOLD}║  🎯 FestPanel Code Watchdog                               ║${RESET}`);
  console.log(`${BLUE}${BOLD}╠══════════════════════════════════════════════════════════════╣${RESET}`);
  console.log(`${BLUE}${BOLD}║  Node: ${version.node.padEnd(52)}${RESET}`);
  console.log(`${BLUE}${BOLD}║  Next: ${version.next.padEnd(51)}${RESET}`);
  console.log(`${BLUE}${BOLD}║  CPU:  ${cpuCount} cores${' '.padEnd(47)}${RESET}`);
  console.log(`${BLUE}${BOLD}║  RAM:  ${totalMem} GB${' '.padEnd(49)}${RESET}`);
  console.log(`${BLUE}${BOLD}╚══════════════════════════════════════════════════════════════╝${RESET}`);
  console.log();
}

function runLint(filePath) {
  const start = Date.now();
  console.log(`${YELLOW}🔍 Linting: ${filePath}${RESET}`);

  try {
    execSync(`npx eslint "${filePath}" --fix --format stylish`, {
      cwd: projectRoot,
      stdio: 'pipe',
    });

    const time = Date.now() - start;
    console.log(`${GREEN}✅ Linting passed${RESET} (${time}ms)`);
    return true;
  } catch (error) {
    const time = Date.now() - start;
    console.log(`${RED}❌ Linting failed${RESET} (${time}ms)`);
    if (error.stdout) console.log(error.stdout.toString());
    return false;
  }
}

function runTypeCheck() {
  console.log(`${YELLOW}🔍 Running TypeScript check...${RESET}`);

  try {
    execSync('npx tsc --noEmit', {
      cwd: projectRoot,
      stdio: 'pipe',
    });
    console.log(`${GREEN}✅ TypeScript check passed${RESET}`);
    return true;
  } catch (error) {
    console.log(`${RED}❌ TypeScript check failed${RESET}`);
    if (error.stdout) console.log(error.stdout.toString());
    return false;
  }
}

let lintTimeout = null;
let isRunning = false;

function debouncedLint(filePath) {
  if (isRunning) return;

  isRunning = true;

  clearScreen();
  printHeader();

  runLint(filePath);
  runTypeCheck();

  console.log();
  console.log(`${BLUE}📡 Watching for changes...${RESET}`);

  isRunning = false;
}

clearScreen();
printHeader();

console.log(`${GREEN}✅ All checks passed on startup${RESET}`);
console.log();
console.log(`${BLUE}📡 Watching for file changes in src/...${RESET}`);
console.log(`${YELLOW}Press Ctrl+C to stop${RESET}`);
console.log();

const watcher = chokidar.watch(patterns, {
  cwd: projectRoot,
  persistent: true,
  ignoreInitial: true,
  awaitWriteFinish: {
    stabilityThreshold: 500,
    pollInterval: 100,
  },
});

watcher.on('change', (path) => {
  debouncedLint(path);
});

watcher.on('add', (path) => {
  debouncedLint(path);
});

watcher.on('error', (error) => {
  console.error(`${RED}❌ Watcher error: ${error.message}${RESET}`);
});

process.on('SIGINT', () => {
  console.log(`\n${YELLOW}👋 Stopping watchdog...${RESET}`);
  watcher.close();
  process.exit(0);
});
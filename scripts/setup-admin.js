#!/usr/bin/env node
import bcrypt from 'bcryptjs';
import { writeFileSync, existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomBytes } from 'crypto';
import { createInterface } from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env');

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

async function main() {
  console.log('╔══════════════════════════════════════╗');
  console.log('║   FestPanel Admin Setup              ║');
  console.log('╚══════════════════════════════════════╝\n');

  const username = await ask(`Admin username [whitekali]: `) || 'whitekali';

  const password = await ask('Admin password (min 7 chars, numbers + symbols): ');
  if (password.length < 7) {
    console.error('❌ Password must be at least 7 characters!');
    rl.close();
    process.exit(1);
  }

  const hash = bcrypt.hashSync(password, 10);
  const secret = randomBytes(32).toString('base64');

  let envContent = '';
  if (existsSync(envPath)) {
    envContent = readFileSync(envPath, 'utf-8');
  }

  const newVars = {
    ADMIN_USER: username,
    ADMIN_HASH: hash,
    NEXTAUTH_SECRET: secret,
  };

  for (const [key, value] of Object.entries(newVars)) {
    const regex = new RegExp(`^${key}=.*`, 'm');
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `${key}=${value}`);
    } else {
      envContent += `\n${key}=${value}`;
    }
  }

  writeFileSync(envPath, envContent.trim() + '\n');
  console.log(`\n✅ .env updated successfully at: ${envPath}`);
  console.log(`   Username: ${username}`);
  console.log(`   Login at: http://localhost:3000/js/auth/login\n`);
  rl.close();
}

main();
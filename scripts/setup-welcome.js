#!/usr/bin/env node
import { writeFileSync, existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const configPath = join(__dirname, '..', 'welcome_config.yml');

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

function validateTheme(id) {
  const valid = ['default', 'modern_dark', 'forest_green', 'sunset_orange', 'ocean_blue', 'royal_purple'];
  return valid.indexOf(id) !== -1;
}

async function main() {
  console.log('╔══════════════════════════════════════╗');
  console.log('║   FestPanel Welcome Setup            ║');
  console.log('╚══════════════════════════════════════╝\n');

  const message = await ask(`Welcome message [FestPanel - Profesjonalny Montaż Paneli Podłogowych]: `) || 'FestPanel - Profesjonalny Montaż Paneli Podłogowych';

  const tourInput = await ask('Show dashboard tour on login? (Y/n): ') || 'y';
  const showTour = tourInput.toLowerCase() !== 'n';

  const now = new Date().toISOString().slice(0, 10);

  let configContent = '';
  if (existsSync(configPath)) {
    configContent = readFileSync(configPath, 'utf-8');
  }

  const newConfig = `# FestPanel Welcome Configuration
welcome:
  message: "${message}"
  show_dashboard_tour: ${showTour}
last_updated: "${now}"
`;

  writeFileSync(configPath, newConfig);
  console.log(`\n✅ welcome_config.yml updated at: ${configPath}`);
  console.log(`   Message: ${message}`);
  console.log(`   Dashboard tour: ${showTour ? 'enabled' : 'disabled'}\n`);
  rl.close();
}

main();

import { existsSync, mkdirSync, copyFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const sourceDir = join(rootDir, '../easyplayer-vue3/public/assets/easyplayer');
const destDir = join(rootDir, 'public/assets/easyplayer');
const playgroundDestDir = join(rootDir, 'playground/public/assets/easyplayer');

function copyDir(src, dest) {
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }

  const entries = readdirSync(src);

  for (const entry of entries) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);

    if (statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
      console.log(`Copied: ${entry} -> ${destPath}`);
    }
  }
}

function main() {
  console.log('Syncing EasyPlayer assets...');
  console.log(`Source: ${sourceDir}`);
  console.log(`Dest: ${destDir}`);

  if (!existsSync(sourceDir)) {
    console.warn(`Source directory does not exist: ${sourceDir}`);
    console.warn('Skipping asset sync. Please ensure EasyPlayer assets are available.');
    return;
  }

  copyDir(sourceDir, destDir);
  copyDir(sourceDir, playgroundDestDir);

  console.log('Done!');
}

main();

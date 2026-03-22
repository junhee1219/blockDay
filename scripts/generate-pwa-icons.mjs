/**
 * Generate PWA PNG icons from icon.svg
 *
 * Usage: npx sharp-cli -i public/icon.svg -o public/pwa-192x192.png resize 192 192
 *
 * Or run this script:
 *   node scripts/generate-pwa-icons.mjs
 *
 * Requires: npm install sharp (dev dependency)
 */
import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

async function generateIcons() {
  try {
    const sharp = (await import('sharp')).default;
    const svgBuffer = await readFile(join(root, 'public/icon.svg'));

    // Generate 192x192
    await sharp(svgBuffer)
      .resize(192, 192)
      .png()
      .toFile(join(root, 'public/pwa-192x192.png'));
    console.log('Created pwa-192x192.png');

    // Generate 512x512
    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile(join(root, 'public/pwa-512x512.png'));
    console.log('Created pwa-512x512.png');

    // Generate apple-touch-icon 180x180
    await sharp(svgBuffer)
      .resize(180, 180)
      .png()
      .toFile(join(root, 'public/apple-touch-icon.png'));
    console.log('Created apple-touch-icon.png');

  } catch (e) {
    if (e.code === 'ERR_MODULE_NOT_FOUND') {
      console.error('sharp not found. Install it with: npm install -D sharp');
      console.error('Then re-run: node scripts/generate-pwa-icons.mjs');
    } else {
      throw e;
    }
  }
}

generateIcons();

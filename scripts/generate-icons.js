import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const publicDir = join(__dirname, '..', 'public');

const svgContent = readFileSync(join(publicDir, 'icon.svg'), 'utf-8');

const sizes = [
  { size: 192, name: 'icon-192x192.png' },
  { size: 512, name: 'icon-512x512.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 16, name: 'favicon-16x16.png' },
];

async function generateIcons() {
  console.log('Generating icons...');

  for (const { size, name } of sizes) {
    await sharp(Buffer.from(svgContent))
      .resize(size, size)
      .png()
      .toFile(join(publicDir, name));
    console.log(`Created ${name}`);
  }

  console.log('All icons generated successfully!');
}

generateIcons().catch(console.error);

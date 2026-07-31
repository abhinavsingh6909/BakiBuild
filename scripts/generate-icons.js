import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, '..');
const pubDir = path.join(rootDir, 'public');

const possibleNames = ['logo.png', 'logo.jpg', 'logo.jpeg', 'logo.webp', 'logo.svg'];
let inputImage = null;

for (const name of possibleNames) {
  const fullPath = path.join(pubDir, name);
  if (fs.existsSync(fullPath)) {
    inputImage = fullPath;
    break;
  }
}

if (!inputImage) {
  console.error('❌ Error: Could not find your image file in public/ directory!');
  console.log('Please paste your image into: public/logo.png');
  process.exit(1);
}

console.log(`⚡ Generating app icons from: ${inputImage}`);

async function generateAllIcons() {
  await sharp(inputImage).resize(180, 180).png().toFile(path.join(pubDir, 'apple-touch-icon.png'));
  await sharp(inputImage).resize(192, 192).png().toFile(path.join(pubDir, 'icon-192.png'));
  await sharp(inputImage).resize(512, 512).png().toFile(path.join(pubDir, 'icon-512.png'));
  await sharp(inputImage).resize(64, 64).png().toFile(path.join(pubDir, 'favicon.png'));

  console.log('✅ All app icons updated successfully!');
  console.log('1. public/apple-touch-icon.png (180x180)');
  console.log('2. public/icon-192.png (192x192)');
  console.log('3. public/icon-512.png (512x512)');
  console.log('4. public/favicon.png (64x64)');
}

generateAllIcons().catch((err) => {
  console.error('❌ Error converting image:', err);
});

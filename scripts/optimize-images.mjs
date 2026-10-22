// Makes the app-ready images from the originals in assets/rocco/.
// Run it again whenever you replace an image: npm run images
//
// - public/rocco/<name>.webp : small copies used by the app (much lighter than the PNGs)
// - public/icons/*.png       : app icons for installing on phones and desktops

import { readdir, mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SOURCE = 'assets/rocco';
const IMAGES_OUT = 'public/rocco';
const ICONS_OUT = 'public/icons';
const BACKGROUND = '#FAF7F2';

await mkdir(IMAGES_OUT, { recursive: true });
await mkdir(ICONS_OUT, { recursive: true });

const files = (await readdir(SOURCE)).filter((file) => file.endsWith('.png'));

for (const file of files) {
  const name = path.basename(file, '.png');
  await sharp(path.join(SOURCE, file))
    .resize({ width: 640, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(path.join(IMAGES_OUT, `${name}.webp`));
  console.log(`rocco/${name}.webp`);
}

// Icons: Rocco centred on the app background.
// "Maskable" icons get extra padding because phones may cut them into a circle.
const icons = [
  { file: 'icon-192.png', size: 192, padding: 0.06 },
  { file: 'icon-512.png', size: 512, padding: 0.06 },
  { file: 'maskable-512.png', size: 512, padding: 0.2 },
  { file: 'apple-touch-icon.png', size: 180, padding: 0.06 }
];

for (const { file, size, padding } of icons) {
  const inner = Math.round(size * (1 - padding * 2));
  const rocco = await sharp(path.join(SOURCE, 'rocco-base.png')).resize(inner, inner).toBuffer();
  await sharp({ create: { width: size, height: size, channels: 3, background: BACKGROUND } })
    .composite([{ input: rocco, gravity: 'center' }])
    .png()
    .toFile(path.join(ICONS_OUT, file));
  console.log(`icons/${file}`);
}

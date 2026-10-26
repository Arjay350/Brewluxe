const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const root = path.resolve(__dirname, '..');
const source = path.join(root, 'src/assets/images/brewluxe-logo.png');
const resources = path.join(root, 'android/app/src/main/res');
const foregroundScales = {
  'mipmap-mdpi': 1,
  'mipmap-hdpi': 1.5,
  'mipmap-xhdpi': 2,
  'mipmap-xxhdpi': 3,
  'mipmap-xxxhdpi': 4,
};
const legacySizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};
const background = '#F7F2E7';

function makeTransparentLogo({ data, info }) {
  for (let i = 0; i < data.length; i += info.channels) {
    const luminance =
      0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const alpha = Math.max(0, Math.min(255, (225 - luminance) * 3));

    data[i] = 54;
    data[i + 1] = 33;
    data[i + 2] = 22;
    data[i + 3] = Math.round(alpha);
  }
}

async function generateIcons() {
  for (const [density, scale] of Object.entries(foregroundScales)) {
    const size = Math.round(108 * scale);
    const artworkSize = Math.round(size * 0.58);
    const logo = await sharp(source)
      .resize(artworkSize, artworkSize, { fit: 'contain' })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    makeTransparentLogo(logo);

    const foreground = await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([
        {
          input: await sharp(logo.data, { raw: logo.info }).png().toBuffer(),
          gravity: 'centre',
        },
      ])
      .png()
      .toBuffer();

    await sharp(foreground)
      .toFile(path.join(resources, density, 'ic_launcher_foreground.png'));

    const legacySize = legacySizes[density];
    const legacyLogo = await sharp(source)
      .resize(Math.round(legacySize * 0.9), Math.round(legacySize * 0.9), {
        fit: 'contain',
      })
      .png()
      .toBuffer();

    for (const name of ['ic_launcher.png', 'ic_launcher_round.png']) {
      await sharp({
        create: {
          width: legacySize,
          height: legacySize,
          channels: 4,
          background,
        },
      })
        .composite([{ input: legacyLogo, gravity: 'centre' }])
        .png()
        .toFile(path.join(resources, density, name));
    }
  }

  const backgroundFile = path.join(resources, 'values/ic_launcher_background.xml');
  fs.writeFileSync(
    backgroundFile,
    `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">${background}</color>\n</resources>\n`,
  );

  console.log('[Brewluxe] Android launcher icons generated from the Brewluxe logo.');
}

generateIcons().catch((error) => {
  console.error('[Brewluxe] Failed to generate Android launcher icons:', error);
  process.exitCode = 1;
});

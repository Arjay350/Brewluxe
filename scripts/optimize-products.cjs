const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const targetDir = path.join(__dirname, '..', 'src', 'assets', 'images');
fs.mkdirSync(targetDir, { recursive: true });

const mappings = [
  // 1. Hot Coffee (19 items)
  { folder: 'Coffee', file: 'Almond Latte.jpg', out: 'almond-latte.webp' },
  { folder: 'Coffee', file: 'Americano.jpg', out: 'americano.webp' },
  { folder: 'Coffee', file: 'Butterscotch Latte.jpg', out: 'butterscotch-latte.webp' },
  { folder: 'Coffee', file: 'Cafe Latte.jpg', out: 'cafe-latte.webp' },
  { folder: 'Coffee', file: 'Cafe Mocha.jpg', out: 'cafe-mocha.webp' },
  { folder: 'Coffee', file: 'Cappuccino.jpg', out: 'cappuccino.webp' },
  { folder: 'Coffee', file: 'Caramel Macchiato.jpg', out: 'caramel-macchiato.webp' },
  { folder: 'Coffee', file: 'Cinnamon Latte.jpg', out: 'cinnamon-latte.webp' },
  { folder: 'Coffee', file: 'Dark Chocolate Mocha.jpg', out: 'dark-chocolate-mocha.webp' },
  { folder: 'Coffee', file: 'Dirty Matcha.jpg', out: 'dirty-matcha.webp' },
  { folder: 'Coffee', file: 'Double Espresso.jpg', out: 'double-espresso.webp' },
  { folder: 'Coffee', file: 'Espresso Con Panna.jpg', out: 'espresso-con-panna.webp' },
  { folder: 'Coffee', file: 'Espresso.jpg', out: 'espresso.webp' },
  { folder: 'Coffee', file: 'Flat White.jpg', out: 'flat-white.webp' },
  { folder: 'Coffee', file: 'Hazelnut Latte.jpg', out: 'hazelnut-latte.webp' },
  { folder: 'Coffee', file: 'Salted Caramel Latte.jpg', out: 'salted-caramel-latte.webp' },
  { folder: 'Coffee', file: 'Spanish Latte.jpg', out: 'spanish-latte.webp' },
  { folder: 'Coffee', file: 'Vanilla Latte.jpg', out: 'vanilla-latte.webp' },
  { folder: 'Coffee', file: 'White Mocha.jpg', out: 'white-mocha.webp' },

  // 2. Iced Coffee (14 items)
  { folder: 'Iced Coffee', file: 'Iced Almond Latte.jpg', out: 'iced-almond-latte.webp' },
  { folder: 'Iced Coffee', file: 'Iced Americano.jpg', out: 'iced-americano.webp' },
  { folder: 'Iced Coffee', file: 'Iced Butterscotch Latte.jpg', out: 'iced-butterscotch-latte.webp' },
  { folder: 'Iced Coffee', file: 'Iced Cappuccino.jpg', out: 'iced-cappuccino.webp' },
  { folder: 'Iced Coffee', file: 'Iced Caramel Macchiato.jpg', out: 'iced-caramel-macchiato.webp' },
  { folder: 'Iced Coffee', file: 'Iced Cinnamon Latte.jpg', out: 'iced-cinnamon-latte.webp' },
  { folder: 'Iced Coffee', file: 'Iced Dark Mocha.jpg', out: 'iced-dark-mocha.webp' },
  { folder: 'Iced Coffee', file: 'Iced Hazelnut Latte.jpg', out: 'iced-hazelnut-latte.webp' },
  { folder: 'Iced Coffee', file: 'Iced Latte.jpg', out: 'iced-latte.webp' },
  { folder: 'Iced Coffee', file: 'Iced Mocha.jpg', out: 'iced-mocha.webp' },
  { folder: 'Iced Coffee', file: 'Iced Salted Caramel Latte.jpg', out: 'iced-salted-caramel-latte.webp' },
  { folder: 'Iced Coffee', file: 'Iced Spanish Latte.jpg', out: 'iced-spanish-latte.webp' },
  { folder: 'Iced Coffee', file: 'Iced Vanilla Latte.jpg', out: 'iced-vanilla-latte.webp' },
  { folder: 'Iced Coffee', file: 'Iced White Mocha.jpg', out: 'iced-white-mocha.webp' },

  // 3. Frappes (18 items)
  { folder: '(DONE) frappe images', file: 'caramel frappe.jfif', out: 'caramel-frappe.webp' },
  { folder: '(DONE) frappe images', file: 'chocolate frappe.jfif', out: 'chocolate-frappe.webp' },
  { folder: '(DONE) frappe images', file: 'coffee frappe.jfif', out: 'coffee-frappe.webp' },
  { folder: '(DONE) frappe images', file: 'cookies and cream frappe.jfif', out: 'cookies-and-cream-frappe.webp' },
  { folder: '(DONE) frappe images', file: 'dark chocolate frappe.jfif', out: 'dark-chocolate-frappe.webp' },
  { folder: '(DONE) frappe images', file: 'hazelnut frappe.jfif', out: 'hazelnut-frappe.webp' },
  { folder: '(DONE) frappe images', file: 'java chip frappe.jfif', out: 'java-chip-frappe.webp' },
  { folder: '(DONE) frappe images', file: 'mango frappe.jfif', out: 'mango-frappe.webp' },
  { folder: '(DONE) frappe images', file: 'matcha latte frappe.jfif', out: 'matcha-latte-frappe.webp' },
  { folder: '(DONE) frappe images', file: 'mocha frappe.jfif', out: 'mocha-frappe.webp' },
  { folder: '(DONE) frappe images', file: 'oreo frappe.jfif', out: 'oreo-frappe.webp' },
  { folder: '(DONE) frappe images', file: 'salted caramel frappe.jfif', out: 'salted-caramel-frappe.webp' },
  { folder: '(DONE) frappe images', file: 'spanish latte frappe.jfif', out: 'spanish-latte-frappe.webp' },
  { folder: '(DONE) frappe images', file: 'strawberry frappe.jfif', out: 'strawberry-frappe.webp' },
  { folder: '(DONE) frappe images', file: 'taro frappe.jfif', out: 'taro-frappe.webp' },
  { folder: '(DONE) frappe images', file: 'ube frappe.jfif', out: 'ube-frappe.webp' },
  { folder: '(DONE) frappe images', file: 'vanilla frappe.jfif', out: 'vanilla-frappe.webp' },
  { folder: '(DONE) frappe images', file: 'white mocha frappe.jfif', out: 'white-mocha-frappe.webp' },
];

async function processImages() {
  const sourceRoot = path.join(__dirname, '..', '..');
  let count = 0;
  for (const item of mappings) {
    const srcPath = path.join(sourceRoot, item.folder, item.file);
    if (!fs.existsSync(srcPath)) {
      console.error(`File missing: ${srcPath}`);
      continue;
    }
    const destPath = path.join(targetDir, item.out);
    await sharp(srcPath)
      .resize({ width: 800, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(destPath);
    const stat = fs.statSync(destPath);
    console.log(`[OK] ${item.out} - ${(stat.size / 1024).toFixed(1)} KB`);
    count++;
  }
  console.log(`Successfully converted and optimized ${count}/${mappings.length} product images to WebP.`);
}

processImages().catch((err) => {
  console.error(err);
  process.exit(1);
});

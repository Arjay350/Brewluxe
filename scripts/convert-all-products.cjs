const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const targetDir = path.join(__dirname, '..', 'src', 'assets', 'images');
fs.mkdirSync(targetDir, { recursive: true });

const mappings = [
  // 1. Hot Coffee (19 items)
  { folder: '(DONE) Coffee', file: 'Almond Latte.jpg', out: 'almond-latte.webp' },
  { folder: '(DONE) Coffee', file: 'Americano.jpg', out: 'americano.webp' },
  { folder: '(DONE) Coffee', file: 'Butterscotch Latte.jpg', out: 'butterscotch-latte.webp' },
  { folder: '(DONE) Coffee', file: 'Cafe Latte.jpg', out: 'cafe-latte.webp' },
  { folder: '(DONE) Coffee', file: 'Cafe Mocha.jpg', out: 'cafe-mocha.webp' },
  { folder: '(DONE) Coffee', file: 'Cappuccino.jpg', out: 'cappuccino.webp' },
  { folder: '(DONE) Coffee', file: 'Caramel Macchiato.jpg', out: 'caramel-macchiato.webp' },
  { folder: '(DONE) Coffee', file: 'Cinnamon Latte.jpg', out: 'cinnamon-latte.webp' },
  { folder: '(DONE) Coffee', file: 'Dark Chocolate Mocha.jpg', out: 'dark-chocolate-mocha.webp' },
  { folder: '(DONE) Coffee', file: 'Dirty Matcha.jpg', out: 'dirty-matcha.webp' },
  { folder: '(DONE) Coffee', file: 'Double Espresso.jpg', out: 'double-espresso.webp' },
  { folder: '(DONE) Coffee', file: 'Espresso Con Panna.jpg', out: 'espresso-con-panna.webp' },
  { folder: '(DONE) Coffee', file: 'Espresso.jpg', out: 'espresso.webp' },
  { folder: '(DONE) Coffee', file: 'Flat White.jpg', out: 'flat-white.webp' },
  { folder: '(DONE) Coffee', file: 'Hazelnut Latte.jpg', out: 'hazelnut-latte.webp' },
  { folder: '(DONE) Coffee', file: 'Salted Caramel Latte.jpg', out: 'salted-caramel-latte.webp' },
  { folder: '(DONE) Coffee', file: 'Spanish Latte.jpg', out: 'spanish-latte.webp' },
  { folder: '(DONE) Coffee', file: 'Vanilla Latte.jpg', out: 'vanilla-latte.webp' },
  { folder: '(DONE) Coffee', file: 'White Mocha.jpg', out: 'white-mocha.webp' },

  // 2. Iced Coffee (14 items)
  { folder: '(DONE) Iced Coffee', file: 'Iced Almond Latte.jpg', out: 'iced-almond-latte.webp' },
  { folder: '(DONE) Iced Coffee', file: 'Iced Americano.jpg', out: 'iced-americano.webp' },
  { folder: '(DONE) Iced Coffee', file: 'Iced Butterscotch Latte.jpg', out: 'iced-butterscotch-latte.webp' },
  { folder: '(DONE) Iced Coffee', file: 'Iced Cappuccino.jpg', out: 'iced-cappuccino.webp' },
  { folder: '(DONE) Iced Coffee', file: 'Iced Caramel Macchiato.jpg', out: 'iced-caramel-macchiato.webp' },
  { folder: '(DONE) Iced Coffee', file: 'Iced Cinnamon Latte.jpg', out: 'iced-cinnamon-latte.webp' },
  { folder: '(DONE) Iced Coffee', file: 'Iced Dark Mocha.jpg', out: 'iced-dark-mocha.webp' },
  { folder: '(DONE) Iced Coffee', file: 'Iced Hazelnut Latte.jpg', out: 'iced-hazelnut-latte.webp' },
  { folder: '(DONE) Iced Coffee', file: 'Iced Latte.jpg', out: 'iced-latte.webp' },
  { folder: '(DONE) Iced Coffee', file: 'Iced Mocha.jpg', out: 'iced-mocha.webp' },
  { folder: '(DONE) Iced Coffee', file: 'Iced Salted Caramel Latte.jpg', out: 'iced-salted-caramel-latte.webp' },
  { folder: '(DONE) Iced Coffee', file: 'Iced Spanish Latte.jpg', out: 'iced-spanish-latte.webp' },
  { folder: '(DONE) Iced Coffee', file: 'Iced Vanilla Latte.jpg', out: 'iced-vanilla-latte.webp' },
  { folder: '(DONE) Iced Coffee', file: 'Iced White Mocha.jpg', out: 'iced-white-mocha.webp' },

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

  // 4. Pastries (15 items)
  { folder: '(DONE) Pastries', file: 'Almond Croissant.jpg', out: 'almond-croissant.webp' },
  { folder: '(DONE) Pastries', file: 'Blueberry Danish.jpg', out: 'blueberry-danish.webp' },
  { folder: '(DONE) Pastries', file: 'Blueberry Muffin.jpg', out: 'blueberry-muffin.webp' },
  { folder: '(DONE) Pastries', file: 'Cheese Danish.jpg', out: 'cheese-danish.webp' },
  { folder: '(DONE) Pastries', file: 'Chocolate Eclair.jpg', out: 'chocolate-eclair.webp' },
  { folder: '(DONE) Pastries', file: 'Chocolate Tart.jpg', out: 'chocolate-tart.webp' },
  { folder: '(DONE) Pastries', file: 'Cinnamon Roll.jpg', out: 'cinnamon-roll.webp' },
  { folder: '(DONE) Pastries', file: 'Classic Croissant.jpg', out: 'classic-croissant.webp' },
  { folder: '(DONE) Pastries', file: 'Matcha Croissant.jpg', out: 'matcha-croissant.webp' },
  { folder: '(DONE) Pastries', file: 'Mille-Feuille.jpg', out: 'mille-feuille.webp' },
  { folder: '(DONE) Pastries', file: 'Mixed Berry Tart.jpg', out: 'mixed-berry-tart.webp' },
  { folder: '(DONE) Pastries', file: 'Pain au Chocolat.jpg', out: 'pain-au-chocolat.webp' },
  { folder: '(DONE) Pastries', file: 'Peach Danish.jpg', out: 'peach-danish.webp' },
  { folder: '(DONE) Pastries', file: 'Raisin Danish.jpg', out: 'raisin-danish.webp' },
  { folder: '(DONE) Pastries', file: 'Vanilla Cream Puff.jpg', out: 'vanilla-cream-puff.webp' },

  // 5. Shakes (10 items)
  { folder: '(DONE) shakes', file: 'banana shake.jfif', out: 'banana-shake.webp' },
  { folder: '(DONE) shakes', file: 'caramel shake.jfif', out: 'caramel-shake.webp' },
  { folder: '(DONE) shakes', file: 'chcolate shake.jfif', out: 'chocolate-shake.webp' },
  { folder: '(DONE) shakes', file: 'coffee shake.jfif', out: 'coffee-shake.webp' },
  { folder: '(DONE) shakes', file: 'mango shake.jfif', out: 'mango-shake.webp' },
  { folder: '(DONE) shakes', file: 'matcha shake.jfif', out: 'matcha-shake.webp' },
  { folder: '(DONE) shakes', file: 'oreo shake.jfif', out: 'oreo-shake.webp' },
  { folder: '(DONE) shakes', file: 'strawberry shake.jfif', out: 'strawberry-shake.webp' },
  { folder: '(DONE) shakes', file: 'ube shake.jfif', out: 'ube-shake.webp' },
  { folder: '(DONE) shakes', file: 'vanilla shake.jfif', out: 'vanilla-shake.webp' },

  // 6. Non-Coffee / Specialties (18 items)
  { folder: '(DONE)Non Coffee', file: 'Black Cold Brew.png', out: 'black-cold-brew.webp' },
  { folder: '(DONE)Non Coffee', file: 'Brown Sugar Boba Milk.png', out: 'brown-sugar-boba-milk.webp' },
  { folder: '(DONE)Non Coffee', file: 'Caramel Cream Frappe.png', out: 'caramel-cream.webp' },
  { folder: '(DONE)Non Coffee', file: 'Caramel Macchiato.png', out: 'signature-caramel-macchiato.webp' },
  { folder: '(DONE)Non Coffee', file: 'Chocolate Frappe.png', out: 'artisan-chocolate-blend.webp' },
  { folder: '(DONE)Non Coffee', file: 'Cream Top Cold Brew.png', out: 'cream-top-cold-brew.webp' },
  { folder: '(DONE)Non Coffee', file: 'Espresso Shot.png', out: 'specialty-espresso-shot.webp' },
  { folder: '(DONE)Non Coffee', file: 'Flat White.png', out: 'specialty-flat-white.webp' },
  { folder: '(DONE)Non Coffee', file: 'Iced Cappuccino.png', out: 'signature-iced-cappuccino.webp' },
  { folder: '(DONE)Non Coffee', file: 'Iced Chai  Spice Latte.png', out: 'iced-chai-spice-latte.webp' },
  { folder: '(DONE)Non Coffee', file: 'Iced Chocolate.png', out: 'iced-chocolate.webp' },
  { folder: '(DONE)Non Coffee', file: 'Iced Latte  Iced Americano.png', out: 'iced-duo-brew.webp' },
  { folder: '(DONE)Non Coffee', file: 'Iced Matcha Latte.png', out: 'iced-matcha-latte.webp' },
  { folder: '(DONE)Non Coffee', file: 'Iced Milk Foam Tea.png', out: 'iced-milk-foam-tea.webp' },
  { folder: '(DONE)Non Coffee', file: 'Iced Vanilla Latte.png', out: 'specialty-iced-vanilla-latte.webp' },
  { folder: '(DONE)Non Coffee', file: 'Matcha Caramel Fusion.png', out: 'matcha-caramel-fusion.webp' },
  { folder: '(DONE)Non Coffee', file: 'Strawberry  Coconut Matcha.png', out: 'strawberry-coconut-matcha.webp' },
  { folder: '(DONE)Non Coffee', file: 'Vanilla Milk.png', out: 'vanilla-milk.webp' },
];

async function run() {
  const sourceRoot = path.join(__dirname, '..', '..');
  let successCount = 0;

  console.log(`Starting image optimization for ${mappings.length} products...`);
  for (const item of mappings) {
    const srcPath = path.join(sourceRoot, item.folder, item.file);
    if (!fs.existsSync(srcPath)) {
      console.warn(`[MISSING] Source file not found: ${srcPath}`);
      continue;
    }

    const destPath = path.join(targetDir, item.out);
    await sharp(srcPath)
      .resize({ width: 800, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(destPath);
    const stat = fs.statSync(destPath);
    console.log(`[CONVERTED] ${item.out} (${(stat.size / 1024).toFixed(1)} KB)`);
    successCount++;
  }

  console.log(`Converted ${successCount}/${mappings.length} images to WebP.`);

  // Clean up old dummy .jpg files that don't belong to the products
  const files = fs.readdirSync(targetDir);
  let removedCount = 0;
  for (const file of files) {
    if (file.endsWith('.jpg')) {
      fs.unlinkSync(path.join(targetDir, file));
      removedCount++;
    }
  }
  console.log(`Cleaned up ${removedCount} old dummy .jpg files.`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

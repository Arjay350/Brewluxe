const fs = require('fs');
const path = require('path');

const products = [
  // Hot Coffee (19 items)
  { id: 1, name: 'Espresso', category: 'Coffee', price: 100, image: 'espresso.webp', featured: false, description: 'A concentrated, full-bodied shot of rich espresso with a velvety golden crema.' },
  { id: 2, name: 'Double Espresso', category: 'Coffee', price: 105, image: 'double-espresso.webp', featured: false, description: 'Two bold shots of freshly extracted espresso for a deeper, more robust coffee kick.' },
  { id: 3, name: 'Americano', category: 'Coffee', price: 105, image: 'americano.webp', featured: false, description: 'Classic rich espresso diluted with hot water for a smooth, balanced cup.' },
  { id: 4, name: 'Espresso Con Panna', category: 'Coffee', price: 110, image: 'espresso-con-panna.webp', featured: false, description: 'A rich shot of espresso crowned with a dollop of whipped cream.' },
  { id: 5, name: 'Flat White', category: 'Coffee', price: 110, image: 'flat-white.webp', featured: false, description: 'Smooth espresso blended with velvety steamed milk and a thin layer of microfoam.' },
  { id: 6, name: 'Cappuccino', category: 'Coffee', price: 110, image: 'cappuccino.webp', featured: true, description: 'Equal parts bold espresso, steamed milk, and a thick, airy cloud of frothed milk foam.' },
  { id: 7, name: 'Cafe Latte', category: 'Coffee', price: 110, image: 'cafe-latte.webp', featured: true, description: 'Espresso gently poured into silky steamed whole milk with a delicate foam cap.' },
  { id: 8, name: 'Spanish Latte', category: 'Coffee', price: 115, image: 'spanish-latte.webp', featured: true, description: 'Velvety espresso combined with textured milk and sweetened condensed milk.' },
  { id: 9, name: 'Vanilla Latte', category: 'Coffee', price: 115, image: 'vanilla-latte.webp', featured: false, description: 'Silky espresso and steamed milk kissed with pure Madagascar vanilla extract.' },
  { id: 10, name: 'Caramel Macchiato', category: 'Coffee', price: 120, image: 'caramel-macchiato.webp', featured: true, description: 'Steamed milk stained with bold espresso shots and rich caramel drizzle.' },
  { id: 11, name: 'Hazelnut Latte', category: 'Coffee', price: 120, image: 'hazelnut-latte.webp', featured: false, description: 'Classic latte infused with aromatic roasted hazelnut syrup.' },
  { id: 12, name: 'Salted Caramel Latte', category: 'Coffee', price: 125, image: 'salted-caramel-latte.webp', featured: false, description: 'Rich caramel latte balanced with a touch of mineral sea salt.' },
  { id: 13, name: 'Butterscotch Latte', category: 'Coffee', price: 125, image: 'butterscotch-latte.webp', featured: false, description: 'Smooth espresso and steamed milk flavored with buttery brown sugar butterscotch.' },
  { id: 14, name: 'Almond Latte', category: 'Coffee', price: 125, image: 'almond-latte.webp', featured: false, description: 'Nutty roasted almond syrup blended with espresso and creamy steamed milk.' },
  { id: 15, name: 'Cinnamon Latte', category: 'Coffee', price: 125, image: 'cinnamon-latte.webp', featured: false, description: 'Warm spiced latte dusted with aromatic freshly ground Ceylon cinnamon.' },
  { id: 16, name: 'Cafe Mocha', category: 'Coffee', price: 125, image: 'cafe-mocha.webp', featured: true, description: 'Dark Dutch cocoa melted into bold espresso and textured milk.' },
  { id: 17, name: 'White Mocha', category: 'Coffee', price: 130, image: 'white-mocha.webp', featured: false, description: 'Sweet white chocolate ganache combined with espresso and steamed milk.' },
  { id: 18, name: 'Dark Chocolate Mocha', category: 'Coffee', price: 130, image: 'dark-chocolate-mocha.webp', featured: false, description: 'Intense bittersweet dark chocolate infused with espresso and steamed milk.' },
  { id: 19, name: 'Dirty Matcha', category: 'Coffee', price: 135, image: 'dirty-matcha.webp', featured: true, description: 'A stunning layered fusion of earthy Japanese green tea and a fresh espresso shot.' },

  // Iced Coffee (14 items)
  { id: 20, name: 'Iced Americano', category: 'Iced Coffee', price: 115, image: 'iced-americano.webp', featured: false, description: 'Double shot of bold espresso poured over ice and cold filtered water.' },
  { id: 21, name: 'Iced Latte', category: 'Iced Coffee', price: 120, image: 'iced-latte.webp', featured: true, description: 'Rich espresso combined with chilled whole milk and poured over crystal ice.' },
  { id: 22, name: 'Iced Cappuccino', category: 'Iced Coffee', price: 120, image: 'iced-cappuccino.webp', featured: false, description: 'Chilled espresso and milk crowned with a fluffy layer of cold microfoam.' },
  { id: 23, name: 'Iced Spanish Latte', category: 'Iced Coffee', price: 125, image: 'iced-spanish-latte.webp', featured: true, description: 'Sweetened condensed milk stirred with chilled milk, espresso, and ice.' },
  { id: 24, name: 'Iced Vanilla Latte', category: 'Iced Coffee', price: 125, image: 'iced-vanilla-latte.webp', featured: false, description: 'Chilled whole milk and espresso flavored with fragrant vanilla syrup.' },
  { id: 25, name: 'Iced Caramel Macchiato', category: 'Iced Coffee', price: 130, image: 'iced-caramel-macchiato.webp', featured: true, description: 'Layered iced milk with Madagascar vanilla, espresso, and buttery caramel.' },
  { id: 26, name: 'Iced Hazelnut Latte', category: 'Iced Coffee', price: 130, image: 'iced-hazelnut-latte.webp', featured: false, description: 'Roasted hazelnut infused into chilled milk and freshly pulled espresso.' },
  { id: 27, name: 'Iced Salted Caramel Latte', category: 'Iced Coffee', price: 135, image: 'iced-salted-caramel-latte.webp', featured: false, description: 'Chilled espresso latte accented with savory sea salt and buttery caramel.' },
  { id: 28, name: 'Iced Butterscotch Latte', category: 'Iced Coffee', price: 135, image: 'iced-butterscotch-latte.webp', featured: false, description: 'Sweet butterscotch syrup stirred with chilled milk and dark espresso over ice.' },
  { id: 29, name: 'Iced Almond Latte', category: 'Iced Coffee', price: 135, image: 'iced-almond-latte.webp', featured: false, description: 'Nutty roasted almond flavor layered with milk, espresso, and ice.' },
  { id: 30, name: 'Iced Cinnamon Latte', category: 'Iced Coffee', price: 135, image: 'iced-cinnamon-latte.webp', featured: false, description: 'Refreshing cold milk and espresso spiced with warm cinnamon sugar syrup.' },
  { id: 31, name: 'Iced Mocha', category: 'Iced Coffee', price: 135, image: 'iced-mocha.webp', featured: true, description: 'Rich dark chocolate syrup whisked with cold milk, espresso, and ice.' },
  { id: 32, name: 'Iced White Mocha', category: 'Iced Coffee', price: 140, image: 'iced-white-mocha.webp', featured: false, description: 'Sweet white chocolate sauce mixed with chilled espresso and fresh milk.' },
  { id: 33, name: 'Iced Dark Mocha', category: 'Iced Coffee', price: 140, image: 'iced-dark-mocha.webp', featured: false, description: 'Decadent bittersweet dark chocolate syrup layered with cold espresso and milk.' },

  // Frappes (18 items)
  { id: 34, name: 'Coffee Frappe', category: 'Frappes', price: 135, image: 'coffee-frappe.webp', featured: false, description: 'Freshly brewed espresso blended with rich cream and ice, topped with whipped cream.' },
  { id: 35, name: 'Mocha Frappe', category: 'Frappes', price: 140, image: 'mocha-frappe.webp', featured: true, description: 'Chocolate and espresso ice-blended to creamy perfection with whipped topping.' },
  { id: 36, name: 'White Mocha Frappe', category: 'Frappes', price: 145, image: 'white-mocha-frappe.webp', featured: false, description: 'White chocolate and roasted coffee blend finished with velvety whipped cream.' },
  { id: 37, name: 'Dark Chocolate Frappe', category: 'Frappes', price: 140, image: 'dark-chocolate-frappe.webp', featured: false, description: 'Decadent dark cocoa ice-blended treat crowned with a rich chocolate drizzle.' },
  { id: 38, name: 'Chocolate Frappe', category: 'Frappes', price: 135, image: 'chocolate-frappe.webp', featured: false, description: 'Thick creamy milk chocolate blended with ice and finished with whipped cream.' },
  { id: 39, name: 'Caramel Frappe', category: 'Frappes', price: 140, image: 'caramel-frappe.webp', featured: true, description: 'Buttery caramel blended with rich cream and ice, decorated with caramel swirl.' },
  { id: 40, name: 'Salted Caramel Frappe', category: 'Frappes', price: 145, image: 'salted-caramel-frappe.webp', featured: false, description: 'Sweet and savory sea salt caramel ice blend finished with whipped cream.' },
  { id: 41, name: 'Spanish Latte Frappe', category: 'Frappes', price: 145, image: 'spanish-latte-frappe.webp', featured: false, description: 'Sweet condensed milk and espresso blended with ice into a frosty treat.' },
  { id: 42, name: 'Vanilla Frappe', category: 'Frappes', price: 135, image: 'vanilla-frappe.webp', featured: false, description: 'Sweet Madagascar vanilla bean blended with milk, ice, and whipped cream.' },
  { id: 43, name: 'Hazelnut Frappe', category: 'Frappes', price: 140, image: 'hazelnut-frappe.webp', featured: false, description: 'Roasted nutty hazelnut blended into a luscious frosty beverage.' },
  { id: 44, name: 'Java Chip Frappe', category: 'Frappes', price: 145, image: 'java-chip-frappe.webp', featured: false, description: 'Blended coffee and chocolate loaded with crunchy chocolate chips and whip.' },
  { id: 45, name: 'Cookies and Cream Frappe', category: 'Frappes', price: 145, image: 'cookies-and-cream-frappe.webp', featured: true, description: 'Creamy vanilla ice blend mixed with crushed chocolate sandwich cookies.' },
  { id: 46, name: 'Oreo Frappe', category: 'Frappes', price: 145, image: 'oreo-frappe.webp', featured: false, description: 'Thick, frosty blended cream loaded with real crushed Oreo cookie pieces.' },
  { id: 47, name: 'Matcha Latte Frappe', category: 'Frappes', price: 145, image: 'matcha-latte-frappe.webp', featured: true, description: 'Earthy Japanese green tea blended with milk and ice, topped with whipped cream.' },
  { id: 48, name: 'Strawberry Frappe', category: 'Frappes', price: 145, image: 'strawberry-frappe.webp', featured: true, description: 'Sweet strawberry blended with milk and crushed ice for a fruity refreshment.' },
  { id: 49, name: 'Mango Frappe', category: 'Frappes', price: 145, image: 'mango-frappe.webp', featured: false, description: 'A vibrant tropical ice-blended beverage packed with sweet mango flavor.' },
  { id: 50, name: 'Taro Frappe', category: 'Frappes', price: 150, image: 'taro-frappe.webp', featured: false, description: 'Sweet and creamy blended taro drink with a distinctive purple hue.' },
  { id: 51, name: 'Ube Frappe', category: 'Frappes', price: 150, image: 'ube-frappe.webp', featured: false, description: 'A Filipino favorite blended ube beverage finished with fluffy whipped cream.' },

  // Pastries (15 items)
  { id: 52, name: 'Classic Croissant', category: 'Pastries', price: 95, image: 'classic-croissant.webp', featured: true, description: 'Traditional French croissant crafted with pure European butter for honeycomb-layered flakiness.' },
  { id: 53, name: 'Almond Croissant', category: 'Pastries', price: 110, image: 'almond-croissant.webp', featured: true, description: 'Flaky French croissant filled with rich almond frangipane and topped with toasted sliced almonds.' },
  { id: 54, name: 'Pain au Chocolat', category: 'Pastries', price: 110, image: 'pain-au-chocolat.webp', featured: true, description: 'Buttery laminated pastry enclosing two batons of bittersweet French dark chocolate.' },
  { id: 55, name: 'Matcha Croissant', category: 'Pastries', price: 115, image: 'matcha-croissant.webp', featured: false, description: 'Flaky artisan croissant filled with smooth Uji matcha green tea pastry cream and dusted with matcha powder.' },
  { id: 56, name: 'Blueberry Danish', category: 'Pastries', price: 105, image: 'blueberry-danish.webp', featured: false, description: 'Golden puff pastry centered with sweet vanilla custard and plump wild blueberries.' },
  { id: 57, name: 'Cheese Danish', category: 'Pastries', price: 100, image: 'cheese-danish.webp', featured: false, description: 'Layers of buttery puff pastry filled with creamy, lightly sweetened cream cheese filling.' },
  { id: 58, name: 'Peach Danish', category: 'Pastries', price: 105, image: 'peach-danish.webp', featured: false, description: 'Flaky, buttery pastry filled with smooth custard and tender slices of sweet sun-ripened peaches.' },
  { id: 59, name: 'Raisin Danish', category: 'Pastries', price: 100, image: 'raisin-danish.webp', featured: false, description: 'Swirled laminated pastry studded with plump rum-soaked raisins and cinnamon pastry cream.' },
  { id: 60, name: 'Cinnamon Roll', category: 'Pastries', price: 105, image: 'cinnamon-roll.webp', featured: true, description: 'Warm spiced spiral baked with aromatic Korintje cinnamon and smothered in cream cheese glaze.' },
  { id: 61, name: 'Blueberry Muffin', category: 'Pastries', price: 95, image: 'blueberry-muffin.webp', featured: false, description: 'Moist and tender bakery muffin bursting with fresh juicy blueberries and a golden crumble top.' },
  { id: 62, name: 'Chocolate Eclair', category: 'Pastries', price: 115, image: 'chocolate-eclair.webp', featured: false, description: 'Crisp choux pastry shell piped full of velvety vanilla cream and dipped in glossy dark chocolate ganache.' },
  { id: 63, name: 'Vanilla Cream Puff', category: 'Pastries', price: 90, image: 'vanilla-cream-puff.webp', featured: false, description: 'Delicate crisp choux pastry filled generously with chilled chantilly vanilla bean cream.' },
  { id: 64, name: 'Chocolate Tart', category: 'Pastries', price: 120, image: 'chocolate-tart.webp', featured: false, description: 'Crisp buttery shortcrust pastry filled with an intensely rich and silky dark chocolate ganache.' },
  { id: 65, name: 'Mixed Berry Tart', category: 'Pastries', price: 125, image: 'mixed-berry-tart.webp', featured: true, description: 'Golden butter crust topped with silky pastry cream and an assortment of fresh berries.' },
  { id: 66, name: 'Mille-Feuille', category: 'Pastries', price: 135, image: 'mille-feuille.webp', featured: false, description: 'Three crisp layers of caramelized puff pastry alternating with rich diplomat vanilla bean custard.' },

  // Shakes (10 items)
  { id: 67, name: 'Banana Shake', category: 'Shakes', price: 120, image: 'banana-shake.webp', featured: false, description: 'Naturally sweet and creamy shake made with fresh Cavendish bananas and fresh dairy milk.' },
  { id: 68, name: 'Caramel Shake', category: 'Shakes', price: 125, image: 'caramel-shake.webp', featured: false, description: 'Luscious blended ice shake infused with rich buttery caramel and sweet dairy cream.' },
  { id: 69, name: 'Chocolate Shake', category: 'Shakes', price: 125, image: 'chocolate-shake.webp', featured: true, description: 'Decadent chocolate shake crafted with dark Dutch cocoa, cold milk, and vanilla ice cream.' },
  { id: 70, name: 'Coffee Shake', category: 'Shakes', price: 130, image: 'coffee-shake.webp', featured: false, description: 'Bold espresso blended with creamy vanilla shake base for a smooth, refreshing caffeine lift.' },
  { id: 71, name: 'Mango Shake', category: 'Shakes', price: 125, image: 'mango-shake.webp', featured: true, description: 'Sweet Philippine carabao mangoes blended into a frosty tropical shake.' },
  { id: 72, name: 'Matcha Shake', category: 'Shakes', price: 135, image: 'matcha-shake.webp', featured: false, description: 'Finely ground Japanese matcha whisked and blended into a thick, velvety green tea shake.' },
  { id: 73, name: 'Oreo Shake', category: 'Shakes', price: 130, image: 'oreo-shake.webp', featured: true, description: 'Thick creamy vanilla shake loaded with generous crunchy chunks of real Oreo cookies.' },
  { id: 74, name: 'Strawberry Shake', category: 'Shakes', price: 125, image: 'strawberry-shake.webp', featured: true, description: 'Vibrant sweet strawberry puree blended with cold milk and rich cream.' },
  { id: 75, name: 'Ube Shake', category: 'Shakes', price: 130, image: 'ube-shake.webp', featured: false, description: 'Authentic purple yam blended into a fragrant, velvety Filipino specialty shake.' },
  { id: 76, name: 'Vanilla Shake', category: 'Shakes', price: 115, image: 'vanilla-shake.webp', featured: false, description: 'Classic smooth milkshake blended with pure Madagascar vanilla bean and fresh whole milk.' },

  // Non-Coffee & Specialties (18 items)
  { id: 77, name: 'Black Cold Brew', category: 'Non-Coffee', price: 110, image: 'black-cold-brew.webp', featured: false, description: 'Slow-steeped for 18 hours for an exceptionally smooth, low-acidity refreshing cold brew.' },
  { id: 78, name: 'Brown Sugar Boba Milk', category: 'Non-Coffee', price: 125, image: 'brown-sugar-boba-milk.webp', featured: true, description: 'Creamy fresh milk swirled with warm caramelized brown sugar and chewy boba pearls.' },
  { id: 79, name: 'Caramel Cream', category: 'Non-Coffee', price: 135, image: 'caramel-cream.webp', featured: false, description: 'Caffeine-free ice-blended cream infused with golden caramel and topped with caramel drizzle.' },
  { id: 80, name: 'Signature Caramel Macchiato', category: 'Non-Coffee', price: 125, image: 'signature-caramel-macchiato.webp', featured: true, description: 'Artisan layered drink with vanilla steamed milk, marked with rich espresso and buttery caramel.' },
  { id: 81, name: 'Artisan Chocolate Blend', category: 'Non-Coffee', price: 130, image: 'artisan-chocolate-blend.webp', featured: false, description: 'Frosty, caffeine-free rich cocoa blend crowned with whipped cream and chocolate curls.' },
  { id: 82, name: 'Cream Top Cold Brew', category: 'Non-Coffee', price: 125, image: 'cream-top-cold-brew.webp', featured: true, description: 'Velvety vanilla sweet cream floated atop signature bold cold brew coffee.' },
  { id: 83, name: 'Specialty Espresso Shot', category: 'Non-Coffee', price: 100, image: 'specialty-espresso-shot.webp', featured: false, description: 'Single-origin espresso extraction featuring a thick reddish-brown crema and cocoa notes.' },
  { id: 84, name: 'Specialty Flat White', category: 'Non-Coffee', price: 115, image: 'specialty-flat-white.webp', featured: false, description: 'Silky microfoam poured over rich espresso for an exquisitely balanced profile.' },
  { id: 85, name: 'Signature Iced Cappuccino', category: 'Non-Coffee', price: 115, image: 'signature-iced-cappuccino.webp', featured: false, description: 'Chilled espresso and milk crowned with a dense layer of airy cold foam and cocoa dusting.' },
  { id: 86, name: 'Iced Chai Spice Latte', category: 'Non-Coffee', price: 120, image: 'iced-chai-spice-latte.webp', featured: true, description: 'Aromatic black tea infused with cardamom, cinnamon, clove, and chilled fresh milk.' },
  { id: 87, name: 'Iced Chocolate', category: 'Non-Coffee', price: 110, image: 'iced-chocolate.webp', featured: true, description: 'Premium dark Dutch cocoa melted with fresh cold milk and served over ice.' },
  { id: 88, name: 'Iced Duo Brew', category: 'Non-Coffee', price: 120, image: 'iced-duo-brew.webp', featured: false, description: 'A double-flavor refreshing specialty combining the bold clarity of Americano and creamy latte.' },
  { id: 89, name: 'Iced Matcha Latte', category: 'Non-Coffee', price: 125, image: 'iced-matcha-latte.webp', featured: true, description: 'Ceremonial-grade Japanese green tea whisked over ice and creamy whole milk.' },
  { id: 90, name: 'Iced Milk Foam Tea', category: 'Non-Coffee', price: 115, image: 'iced-milk-foam-tea.webp', featured: false, description: 'Freshly brewed aromatic tea topped with a signature savory-sweet velvety milk foam.' },
  { id: 91, name: 'Specialty Iced Vanilla Latte', category: 'Non-Coffee', price: 120, image: 'specialty-iced-vanilla-latte.webp', featured: false, description: 'Chilled espresso and cold milk infused with aromatic natural vanilla bean syrup.' },
  { id: 92, name: 'Matcha Caramel Fusion', category: 'Non-Coffee', price: 135, image: 'matcha-caramel-fusion.webp', featured: false, description: 'Vibrant matcha latte layered with rich golden caramel for an indulgent bittersweet harmony.' },
  { id: 93, name: 'Strawberry Coconut Matcha', category: 'Non-Coffee', price: 140, image: 'strawberry-coconut-matcha.webp', featured: true, description: 'Tropical coconut milk and sweet strawberry puree topped with vibrant ceremonial matcha.' },
  { id: 94, name: 'Vanilla Milk', category: 'Non-Coffee', price: 95, image: 'vanilla-milk.webp', featured: false, description: 'Chilled wholesome dairy milk lightly sweetened and infused with pure fragrant vanilla.' },
];

// 1. Generate src/app/data/new-products.data.ts
const tsContent = `import { Product } from '../models/product.model';

export const NEW_PRODUCTS: Product[] = ${JSON.stringify(products.map(p => ({ ...p, available: true })), null, 2)};
`;

fs.writeFileSync(path.join(__dirname, '../src/app/data/new-products.data.ts'), tsContent, 'utf8');
console.log(`[OK] Generated src/app/data/new-products.data.ts with ${products.length} products.`);

// 2. Generate supabase/clean-start/006_update_94_products.sql
const sqlLines = products.map(p => {
  const desc = p.description.replace(/'/g, "''");
  const name = p.name.replace(/'/g, "''");
  return `  (${p.id}, '${name}', '${p.category}', '${desc}', ${p.price.toFixed(2)}, '${p.image}', ${p.featured}, true)`;
}).join(',\n');

const sqlContent = `-- ==============================================================================
-- 006_update_94_products.sql
-- Upserts all 94 artisan products with real WebP images across:
-- Coffee (19), Iced Coffee (14), Frappes (18), Pastries (15), Shakes (10), Non-Coffee (18).
-- Removes empty dummy categories (e.g. Milk Tea with 0 images).
-- ==============================================================================

-- Delete any old dummy products with fake IDs or missing images
DELETE FROM public.products WHERE image NOT LIKE '%.webp';

-- Upsert the 94 authentic artisan products
INSERT INTO public.products (id, name, category, description, price, image, featured, available)
VALUES
${sqlLines}
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  featured = EXCLUDED.featured,
  available = EXCLUDED.available;

-- Reset sequence to the highest ID
SELECT setval(pg_get_serial_sequence('public.products', 'id'), coalesce((SELECT max(id) FROM public.products), 1), true);

-- Quick summary check
SELECT category, count(*) AS total_items
FROM public.products
GROUP BY category
ORDER BY total_items DESC;
`;

fs.writeFileSync(path.join(__dirname, '../supabase/clean-start/006_update_94_products.sql'), sqlContent, 'utf8');
fs.writeFileSync(path.join(__dirname, '../supabase/new-products.sql'), sqlContent, 'utf8');
console.log(`[OK] Generated supabase/clean-start/006_update_94_products.sql and supabase/new-products.sql.`);

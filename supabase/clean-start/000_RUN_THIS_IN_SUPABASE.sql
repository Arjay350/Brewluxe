-- ==============================================================================
-- BREWLUXE: COMPLETE ONE-CLICK MASTER SCRIPT FOR SUPABASE
-- Run this in your Supabase SQL Editor:
-- 1. Enables Realtime live updates on the orders table
-- 2. Upserts all 94 artisan products with real WebP images
-- 3. Resets the product ID auto-increment counter
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. ENABLE REALTIME
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 2. UPSERT ALL 94 ARTISAN PRODUCTS
-- ------------------------------------------------------------------------------
INSERT INTO public.products (id, name, category, description, price, image, featured, available)
VALUES
  (1, 'Espresso', 'Coffee', 'A concentrated, full-bodied shot of rich espresso with a velvety golden crema.', 100.00, 'espresso.webp', false, true),
  (2, 'Double Espresso', 'Coffee', 'Two bold shots of freshly extracted espresso for a deeper, more robust coffee kick.', 105.00, 'double-espresso.webp', false, true),
  (3, 'Americano', 'Coffee', 'Classic rich espresso diluted with hot water for a smooth, balanced cup.', 105.00, 'americano.webp', false, true),
  (4, 'Espresso Con Panna', 'Coffee', 'A rich shot of espresso crowned with a dollop of whipped cream.', 110.00, 'espresso-con-panna.webp', false, true),
  (5, 'Flat White', 'Coffee', 'Smooth espresso blended with velvety steamed milk and a thin layer of microfoam.', 110.00, 'flat-white.webp', false, true),
  (6, 'Cappuccino', 'Coffee', 'Equal parts bold espresso, steamed milk, and a thick, airy cloud of frothed milk foam.', 110.00, 'cappuccino.webp', true, true),
  (7, 'Cafe Latte', 'Coffee', 'Espresso gently poured into silky steamed whole milk with a delicate foam cap.', 110.00, 'cafe-latte.webp', true, true),
  (8, 'Spanish Latte', 'Coffee', 'Velvety espresso combined with textured milk and sweetened condensed milk.', 115.00, 'spanish-latte.webp', true, true),
  (9, 'Vanilla Latte', 'Coffee', 'Silky espresso and steamed milk kissed with pure Madagascar vanilla extract.', 115.00, 'vanilla-latte.webp', false, true),
  (10, 'Caramel Macchiato', 'Coffee', 'Steamed milk stained with bold espresso shots and rich caramel drizzle.', 120.00, 'caramel-macchiato.webp', true, true),
  (11, 'Hazelnut Latte', 'Coffee', 'Classic latte infused with aromatic roasted hazelnut syrup.', 120.00, 'hazelnut-latte.webp', false, true),
  (12, 'Salted Caramel Latte', 'Coffee', 'Rich caramel latte balanced with a touch of mineral sea salt.', 125.00, 'salted-caramel-latte.webp', false, true),
  (13, 'Butterscotch Latte', 'Coffee', 'Smooth espresso and steamed milk flavored with buttery brown sugar butterscotch.', 125.00, 'butterscotch-latte.webp', false, true),
  (14, 'Almond Latte', 'Coffee', 'Nutty roasted almond syrup blended with espresso and creamy steamed milk.', 125.00, 'almond-latte.webp', false, true),
  (15, 'Cinnamon Latte', 'Coffee', 'Warm spiced latte dusted with aromatic freshly ground Ceylon cinnamon.', 125.00, 'cinnamon-latte.webp', false, true),
  (16, 'Cafe Mocha', 'Coffee', 'Dark Dutch cocoa melted into bold espresso and textured milk.', 125.00, 'cafe-mocha.webp', true, true),
  (17, 'White Mocha', 'Coffee', 'Sweet white chocolate ganache combined with espresso and steamed milk.', 130.00, 'white-mocha.webp', false, true),
  (18, 'Dark Chocolate Mocha', 'Coffee', 'Intense bittersweet dark chocolate infused with espresso and steamed milk.', 130.00, 'dark-chocolate-mocha.webp', false, true),
  (19, 'Dirty Matcha', 'Coffee', 'A stunning layered fusion of earthy Japanese green tea and a fresh espresso shot.', 135.00, 'dirty-matcha.webp', true, true),
  (20, 'Iced Americano', 'Iced Coffee', 'Double shot of bold espresso poured over ice and cold filtered water.', 115.00, 'iced-americano.webp', false, true),
  (21, 'Iced Latte', 'Iced Coffee', 'Rich espresso combined with chilled whole milk and poured over crystal ice.', 120.00, 'iced-latte.webp', true, true),
  (22, 'Iced Cappuccino', 'Iced Coffee', 'Chilled espresso and milk crowned with a fluffy layer of cold microfoam.', 120.00, 'iced-cappuccino.webp', false, true),
  (23, 'Iced Spanish Latte', 'Iced Coffee', 'Sweetened condensed milk stirred with chilled milk, espresso, and ice.', 125.00, 'iced-spanish-latte.webp', true, true),
  (24, 'Iced Vanilla Latte', 'Iced Coffee', 'Chilled whole milk and espresso flavored with fragrant vanilla syrup.', 125.00, 'iced-vanilla-latte.webp', false, true),
  (25, 'Iced Caramel Macchiato', 'Iced Coffee', 'Layered iced milk with Madagascar vanilla, espresso, and buttery caramel.', 130.00, 'iced-caramel-macchiato.webp', true, true),
  (26, 'Iced Hazelnut Latte', 'Iced Coffee', 'Roasted hazelnut infused into chilled milk and freshly pulled espresso.', 130.00, 'iced-hazelnut-latte.webp', false, true),
  (27, 'Iced Salted Caramel Latte', 'Iced Coffee', 'Chilled espresso latte accented with savory sea salt and buttery caramel.', 135.00, 'iced-salted-caramel-latte.webp', false, true),
  (28, 'Iced Butterscotch Latte', 'Iced Coffee', 'Sweet butterscotch syrup stirred with chilled milk and dark espresso over ice.', 135.00, 'iced-butterscotch-latte.webp', false, true),
  (29, 'Iced Almond Latte', 'Iced Coffee', 'Nutty roasted almond flavor layered with milk, espresso, and ice.', 135.00, 'iced-almond-latte.webp', false, true),
  (30, 'Iced Cinnamon Latte', 'Iced Coffee', 'Refreshing cold milk and espresso spiced with warm cinnamon sugar syrup.', 135.00, 'iced-cinnamon-latte.webp', false, true),
  (31, 'Iced Mocha', 'Iced Coffee', 'Rich dark chocolate syrup whisked with cold milk, espresso, and ice.', 135.00, 'iced-mocha.webp', true, true),
  (32, 'Iced White Mocha', 'Iced Coffee', 'Sweet white chocolate sauce mixed with chilled espresso and fresh milk.', 140.00, 'iced-white-mocha.webp', false, true),
  (33, 'Iced Dark Mocha', 'Iced Coffee', 'Decadent bittersweet dark chocolate syrup layered with cold espresso and milk.', 140.00, 'iced-dark-mocha.webp', false, true),
  (34, 'Coffee Frappe', 'Frappes', 'Freshly brewed espresso blended with rich cream and ice, topped with whipped cream.', 135.00, 'coffee-frappe.webp', false, true),
  (35, 'Mocha Frappe', 'Frappes', 'Chocolate and espresso ice-blended to creamy perfection with whipped topping.', 140.00, 'mocha-frappe.webp', true, true),
  (36, 'White Mocha Frappe', 'Frappes', 'White chocolate and roasted coffee blend finished with velvety whipped cream.', 145.00, 'white-mocha-frappe.webp', false, true),
  (37, 'Dark Chocolate Frappe', 'Frappes', 'Decadent dark cocoa ice-blended treat crowned with a rich chocolate drizzle.', 140.00, 'dark-chocolate-frappe.webp', false, true),
  (38, 'Chocolate Frappe', 'Frappes', 'Thick creamy milk chocolate blended with ice and finished with whipped cream.', 135.00, 'chocolate-frappe.webp', false, true),
  (39, 'Caramel Frappe', 'Frappes', 'Buttery caramel blended with rich cream and ice, decorated with caramel swirl.', 140.00, 'caramel-frappe.webp', true, true),
  (40, 'Salted Caramel Frappe', 'Frappes', 'Sweet and savory sea salt caramel ice blend finished with whipped cream.', 145.00, 'salted-caramel-frappe.webp', false, true),
  (41, 'Spanish Latte Frappe', 'Frappes', 'Sweet condensed milk and espresso blended with ice into a frosty treat.', 145.00, 'spanish-latte-frappe.webp', false, true),
  (42, 'Vanilla Frappe', 'Frappes', 'Sweet Madagascar vanilla bean blended with milk, ice, and whipped cream.', 135.00, 'vanilla-frappe.webp', false, true),
  (43, 'Hazelnut Frappe', 'Frappes', 'Roasted nutty hazelnut blended into a luscious frosty beverage.', 140.00, 'hazelnut-frappe.webp', false, true),
  (44, 'Java Chip Frappe', 'Frappes', 'Blended coffee and chocolate loaded with crunchy chocolate chips and whip.', 145.00, 'java-chip-frappe.webp', false, true),
  (45, 'Cookies and Cream Frappe', 'Frappes', 'Creamy vanilla ice blend mixed with crushed chocolate sandwich cookies.', 145.00, 'cookies-and-cream-frappe.webp', true, true),
  (46, 'Oreo Frappe', 'Frappes', 'Thick, frosty blended cream loaded with real crushed Oreo cookie pieces.', 145.00, 'oreo-frappe.webp', false, true),
  (47, 'Matcha Latte Frappe', 'Frappes', 'Earthy Japanese green tea blended with milk and ice, topped with whipped cream.', 145.00, 'matcha-latte-frappe.webp', true, true),
  (48, 'Strawberry Frappe', 'Frappes', 'Sweet strawberry blended with milk and crushed ice for a fruity refreshment.', 145.00, 'strawberry-frappe.webp', true, true),
  (49, 'Mango Frappe', 'Frappes', 'A vibrant tropical ice-blended beverage packed with sweet mango flavor.', 145.00, 'mango-frappe.webp', false, true),
  (50, 'Taro Frappe', 'Frappes', 'Sweet and creamy blended taro drink with a distinctive purple hue.', 150.00, 'taro-frappe.webp', false, true),
  (51, 'Ube Frappe', 'Frappes', 'A Filipino favorite blended ube beverage finished with fluffy whipped cream.', 150.00, 'ube-frappe.webp', false, true),
  (52, 'Classic Croissant', 'Pastries', 'Traditional French croissant crafted with pure European butter for honeycomb-layered flakiness.', 95.00, 'classic-croissant.webp', true, true),
  (53, 'Almond Croissant', 'Pastries', 'Flaky French croissant filled with rich almond frangipane and topped with toasted sliced almonds.', 110.00, 'almond-croissant.webp', true, true),
  (54, 'Pain au Chocolat', 'Pastries', 'Buttery laminated pastry enclosing two batons of bittersweet French dark chocolate.', 110.00, 'pain-au-chocolat.webp', true, true),
  (55, 'Matcha Croissant', 'Pastries', 'Flaky artisan croissant filled with smooth Uji matcha green tea pastry cream and dusted with matcha powder.', 115.00, 'matcha-croissant.webp', false, true),
  (56, 'Blueberry Danish', 'Pastries', 'Golden puff pastry centered with sweet vanilla custard and plump wild blueberries.', 105.00, 'blueberry-danish.webp', false, true),
  (57, 'Cheese Danish', 'Pastries', 'Layers of buttery puff pastry filled with creamy, lightly sweetened cream cheese filling.', 100.00, 'cheese-danish.webp', false, true),
  (58, 'Peach Danish', 'Pastries', 'Flaky, buttery pastry filled with smooth custard and tender slices of sweet sun-ripened peaches.', 105.00, 'peach-danish.webp', false, true),
  (59, 'Raisin Danish', 'Pastries', 'Swirled laminated pastry studded with plump rum-soaked raisins and cinnamon pastry cream.', 100.00, 'raisin-danish.webp', false, true),
  (60, 'Cinnamon Roll', 'Pastries', 'Warm spiced spiral baked with aromatic Korintje cinnamon and smothered in cream cheese glaze.', 105.00, 'cinnamon-roll.webp', true, true),
  (61, 'Blueberry Muffin', 'Pastries', 'Moist and tender bakery muffin bursting with fresh juicy blueberries and a golden crumble top.', 95.00, 'blueberry-muffin.webp', false, true),
  (62, 'Chocolate Eclair', 'Pastries', 'Crisp choux pastry shell piped full of velvety vanilla cream and dipped in glossy dark chocolate ganache.', 115.00, 'chocolate-eclair.webp', false, true),
  (63, 'Vanilla Cream Puff', 'Pastries', 'Delicate crisp choux pastry filled generously with chilled chantilly vanilla bean cream.', 90.00, 'vanilla-cream-puff.webp', false, true),
  (64, 'Chocolate Tart', 'Pastries', 'Crisp buttery shortcrust pastry filled with an intensely rich and silky dark chocolate ganache.', 120.00, 'chocolate-tart.webp', false, true),
  (65, 'Mixed Berry Tart', 'Pastries', 'Golden butter crust topped with silky pastry cream and an assortment of fresh berries.', 125.00, 'mixed-berry-tart.webp', true, true),
  (66, 'Mille-Feuille', 'Pastries', 'Three crisp layers of caramelized puff pastry alternating with rich diplomat vanilla bean custard.', 135.00, 'mille-feuille.webp', false, true),
  (67, 'Banana Shake', 'Shakes', 'Naturally sweet and creamy shake made with fresh Cavendish bananas and fresh dairy milk.', 120.00, 'banana-shake.webp', false, true),
  (68, 'Caramel Shake', 'Shakes', 'Luscious blended ice shake infused with rich buttery caramel and sweet dairy cream.', 125.00, 'caramel-shake.webp', false, true),
  (69, 'Chocolate Shake', 'Shakes', 'Decadent chocolate shake crafted with dark Dutch cocoa, cold milk, and vanilla ice cream.', 125.00, 'chocolate-shake.webp', true, true),
  (70, 'Coffee Shake', 'Shakes', 'Bold espresso blended with creamy vanilla shake base for a smooth, refreshing caffeine lift.', 130.00, 'coffee-shake.webp', false, true),
  (71, 'Mango Shake', 'Shakes', 'Sweet Philippine carabao mangoes blended into a frosty tropical shake.', 125.00, 'mango-shake.webp', true, true),
  (72, 'Matcha Shake', 'Shakes', 'Finely ground Japanese matcha whisked and blended into a thick, velvety green tea shake.', 135.00, 'matcha-shake.webp', false, true),
  (73, 'Oreo Shake', 'Shakes', 'Thick creamy vanilla shake loaded with generous crunchy chunks of real Oreo cookies.', 130.00, 'oreo-shake.webp', true, true),
  (74, 'Strawberry Shake', 'Shakes', 'Vibrant sweet strawberry puree blended with cold milk and rich cream.', 125.00, 'strawberry-shake.webp', true, true),
  (75, 'Ube Shake', 'Shakes', 'Authentic purple yam blended into a fragrant, velvety Filipino specialty shake.', 130.00, 'ube-shake.webp', false, true),
  (76, 'Vanilla Shake', 'Shakes', 'Classic smooth milkshake blended with pure Madagascar vanilla bean and fresh whole milk.', 115.00, 'vanilla-shake.webp', false, true),
  (77, 'Black Cold Brew', 'Non-Coffee', 'Slow-steeped for 18 hours for an exceptionally smooth, low-acidity refreshing cold brew.', 110.00, 'black-cold-brew.webp', false, true),
  (78, 'Brown Sugar Boba Milk', 'Non-Coffee', 'Creamy fresh milk swirled with warm caramelized brown sugar and chewy boba pearls.', 125.00, 'brown-sugar-boba-milk.webp', true, true),
  (79, 'Caramel Cream', 'Non-Coffee', 'Caffeine-free ice-blended cream infused with golden caramel and topped with caramel drizzle.', 135.00, 'caramel-cream.webp', false, true),
  (80, 'Signature Caramel Macchiato', 'Non-Coffee', 'Artisan layered drink with vanilla steamed milk, marked with rich espresso and buttery caramel.', 125.00, 'signature-caramel-macchiato.webp', true, true),
  (81, 'Artisan Chocolate Blend', 'Non-Coffee', 'Frosty, caffeine-free rich cocoa blend crowned with whipped cream and chocolate curls.', 130.00, 'artisan-chocolate-blend.webp', false, true),
  (82, 'Cream Top Cold Brew', 'Non-Coffee', 'Velvety vanilla sweet cream floated atop signature bold cold brew coffee.', 125.00, 'cream-top-cold-brew.webp', true, true),
  (83, 'Specialty Espresso Shot', 'Non-Coffee', 'Single-origin espresso extraction featuring a thick reddish-brown crema and cocoa notes.', 100.00, 'specialty-espresso-shot.webp', false, true),
  (84, 'Specialty Flat White', 'Non-Coffee', 'Silky microfoam poured over rich espresso for an exquisitely balanced profile.', 115.00, 'specialty-flat-white.webp', false, true),
  (85, 'Signature Iced Cappuccino', 'Non-Coffee', 'Chilled espresso and milk crowned with a dense layer of airy cold foam and cocoa dusting.', 115.00, 'signature-iced-cappuccino.webp', false, true),
  (86, 'Iced Chai Spice Latte', 'Non-Coffee', 'Aromatic black tea infused with cardamom, cinnamon, clove, and chilled fresh milk.', 120.00, 'iced-chai-spice-latte.webp', true, true),
  (87, 'Iced Chocolate', 'Non-Coffee', 'Premium dark Dutch cocoa melted with fresh cold milk and served over ice.', 110.00, 'iced-chocolate.webp', true, true),
  (88, 'Iced Duo Brew', 'Non-Coffee', 'A double-flavor refreshing specialty combining the bold clarity of Americano and creamy latte.', 120.00, 'iced-duo-brew.webp', false, true),
  (89, 'Iced Matcha Latte', 'Non-Coffee', 'Ceremonial-grade Japanese green tea whisked over ice and creamy whole milk.', 125.00, 'iced-matcha-latte.webp', true, true),
  (90, 'Iced Milk Foam Tea', 'Non-Coffee', 'Freshly brewed aromatic tea topped with a signature savory-sweet velvety milk foam.', 115.00, 'iced-milk-foam-tea.webp', false, true),
  (91, 'Specialty Iced Vanilla Latte', 'Non-Coffee', 'Chilled espresso and cold milk infused with aromatic natural vanilla bean syrup.', 120.00, 'specialty-iced-vanilla-latte.webp', false, true),
  (92, 'Matcha Caramel Fusion', 'Non-Coffee', 'Vibrant matcha latte layered with rich golden caramel for an indulgent bittersweet harmony.', 135.00, 'matcha-caramel-fusion.webp', false, true),
  (93, 'Strawberry Coconut Matcha', 'Non-Coffee', 'Tropical coconut milk and sweet strawberry puree topped with vibrant ceremonial matcha.', 140.00, 'strawberry-coconut-matcha.webp', true, true),
  (94, 'Vanilla Milk', 'Non-Coffee', 'Chilled wholesome dairy milk lightly sweetened and infused with pure fragrant vanilla.', 95.00, 'vanilla-milk.webp', false, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  featured = EXCLUDED.featured,
  available = EXCLUDED.available;

-- ------------------------------------------------------------------------------
-- 3. RESET ID AUTO-INCREMENT COUNTER
-- ------------------------------------------------------------------------------
SELECT setval(pg_get_serial_sequence('public.products', 'id'), coalesce((SELECT max(id) FROM public.products), 1), true);

-- ------------------------------------------------------------------------------
-- 4. VERIFY RESULTS BY CATEGORY
-- ------------------------------------------------------------------------------
SELECT category, count(*) AS total_items
FROM public.products
GROUP BY category
ORDER BY total_items DESC;

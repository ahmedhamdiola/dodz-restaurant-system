-- Seed data generated from client/src/features/menu/data.ts

INSERT INTO categories (id, name, cover_image, icon_image, slug) VALUES
(20150884, 'Bundles', 'https://talabat.dhmedia.io/image/talabat/MenuItems/WhatsApp_Image_20260111_a639038074343767288.jpeg?width=400', 'https://talabat.dhmedia.io/image/talabat/MenuItems/WhatsApp_Image_20260111_a639038074343767288.jpeg?width=400', 'bundles'),
(19653587, 'Single Meals', 'https://talabat.dhmedia.io/image/talabat/MenuItems/mmw_638938145051185287?width=400', 'https://talabat.dhmedia.io/image/talabat/MenuItems/mmw_638938145051185287?width=400', 'single-meals'),
(19653585, 'Family Meals', 'https://talabat.dhmedia.io/image/talabat/MenuItems/mmw_638938148358404917?width=400', 'https://talabat.dhmedia.io/image/talabat/MenuItems/mmw_638938148358404917?width=400', 'family-meals'),
(19653589, 'Kids Meals', 'https://talabat.dhmedia.io/image/talabat/MenuItems/mmw_638946579749596278?width=400', 'https://talabat.dhmedia.io/image/talabat/MenuItems/mmw_638946579749596278?width=400', 'kids-meals'),
(19653594, 'Sandwiches', 'https://talabat.dhmedia.io/image/talabat/MenuItems/WhatsApp_Image_20250918_a638938028900195085.jpeg?width=400', 'https://talabat.dhmedia.io/image/talabat/MenuItems/WhatsApp_Image_20250918_a638938028900195085.jpeg?width=400', 'sandwiches'),
(19653595, 'Burger', 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/f1a59e0a-3b1e-45e6-abc3-613941c895c0.jpg?width=400', 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/f1a59e0a-3b1e-45e6-abc3-613941c895c0.jpg?width=400', 'burger'),
(19896634, 'Chicken Wings', 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771237/product/2579257726/8a2b0a4a-8585-419e-9222-14c1a8d4cbd1.jpg?width=400', 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771237/product/2579257726/8a2b0a4a-8585-419e-9222-14c1a8d4cbd1.jpg?width=400', 'chicken-wings'),
(19653592, 'Appetizers', 'https://talabat.dhmedia.io/image/talabat/MenuItems/mmw_638944933890527259?width=400', 'https://talabat.dhmedia.io/image/talabat/MenuItems/mmw_638944933890527259?width=400', 'appetizers'),
(19653588, 'Sauces', 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/b02e95a4-352e-4f94-85f3-f00a0021c538.jpg?width=400', 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/b02e95a4-352e-4f94-85f3-f00a0021c538.jpg?width=400', 'sauces'),
(19653591, 'Add Ons', 'https://talabat.dhmedia.io/image/talabat/MenuItems/mmw_638946582330610512?width=400', 'https://talabat.dhmedia.io/image/talabat/MenuItems/mmw_638946582330610512?width=400', 'add-ons'),
(19653593, 'Drinks', 'https://talabat.dhmedia.io/image/talabat/MenuItems/WhatsApp_Image_20250918_a638938043011836257.jpeg?width=400', 'https://talabat.dhmedia.io/image/talabat/MenuItems/WhatsApp_Image_20250918_a638938043011836257.jpeg?width=400', 'drinks')
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (category_id, name, description, price, image, is_customizable)
-- Guarded so re-running the seed never duplicates catalogue rows.
SELECT v.category_id, v.name, v.description, v.price, v.image, v.is_customizable
FROM (VALUES
(
20150884, 'Solo Crave', 'Your choice of sandwich, a piece of chicken, fries, coleslaw, and a drink.', 317.6, 'https://talabat.dhmedia.io/image/talabat/MenuItems/WhatsApp_Image_20260111_a639038074343767288.jpeg?width=400', false),
(20150884, 'Double Dip', '2 sandwiches of your choice, 2 Nashville tender pieces, cheese fries, cup sauce, 2 drinks', 652.8, 'https://talabat.dhmedia.io/image/talabat/MenuItems/Double639038075270608746.jpg?width=400', false),
(20150884, 'Festival Box', '4 chicken pieces, 4 tenders, 4 wings, 2 sandwiches, 3 sauces, and family fries', 966.7, 'https://talabat.dhmedia.io/image/talabat/MenuItems/Fes639038075839187358.jpg?width=400', false),
(20150884, 'Nashy', '2 Nashville Sandwiches, cheese fries, hot honey wings', 694.8, 'https://talabat.dhmedia.io/image/talabat/MenuItems/Nashi639038076505419137.jpg?width=400', false),
(19653587, 'Doodz Snack', '2 pieces fried chicken, French fries, coleslaw, bread', 160, 'https://talabat.dhmedia.io/image/talabat/MenuItems/mmw_638938145051185287?width=400', false),
(19653587, 'Nashville Tenders', '3 delicious tenders with our signature Nashville sauce and tasty Dodz sauce, served with fresh toast and crispy fried corn.', 265, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771283/product/7028a4a9-c2e3-4cd3-95d2-6cdf3cc6238b.jpg?width=400', false),
(19653587, 'Super Nashville Tender', '5 chicken tenders with Nashville sauce, delicious Dude sauce, fresh toast, and tasty fried corn.', 370, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771283/product/e200754b-454d-4cf7-b67d-977f485441bb.jpg?width=400', false),
(19653587, 'Doodz Diner', '3 pieces of fried chicken, fries, coleslaw, bread', 260, 'https://talabat.dhmedia.io/image/talabat/MenuItems/mmw_638938145443321047?width=400', false),
(19653587, 'Super Doodz', '4 pieces of fried chicken, French fries, coleslaw, bread', 310, 'https://talabat.dhmedia.io/image/talabat/MenuItems/mmw_638943317018292375?width=400', false),
(19653587, 'Tender Box', '3 tender pieces, French fries, coleslaw, bread', 185, 'https://talabat.dhmedia.io/image/talabat/MenuItems/mmw_638943316917907892?width=400', false),
(19653587, 'Super Tender Box', '5 pieces of tenders, fries, coleslaw, bread', 275, 'https://talabat.dhmedia.io/image/talabat/MenuItems/mmw_638943315226246026?width=400', false),
(19653587, 'Mix Box', '2 pieces fried chicken, 2 chicken tenders, French fries, coleslaw, bread', 265, 'https://talabat.dhmedia.io/image/talabat/MenuItems/mmw_638938146064885004?width=400', false),
(19653585, 'Family Meal', '8 pieces fried chicken, family fries, family coleslaw, bread, 1 liter soft drink', 690, 'https://talabat.dhmedia.io/image/talabat/MenuItems/mmw_638938148358404917?width=400', false),
(19653585, 'Family Mix Meal', '6 pieces fried chicken, 6 pieces chicken tenders, family fries, family coleslaw, bread, 1 liter soda.', 805, 'https://talabat.dhmedia.io/image/talabat/MenuItems/mmw_638942535452388590?width=400', false),
(19653585, 'Star Meal', '12 pieces of fried chicken, family fries, family coleslaw, drink, bread', 905, 'https://talabat.dhmedia.io/image/talabat/MenuItems/mmw_638943314567338822?width=400', false),
(19653585, 'Mega Star Family Meal', '15 pieces of fried chicken, family fries, family coleslaw, bread, 1 liter soda', 1035, 'https://talabat.dhmedia.io/image/talabat/MenuItems/WhatsApp_Image_20250918_a638938028588175575.jpeg?width=400', false),
(19653585, 'Big Family Meal', '18 pieces fried chicken, family fries, family coleslaw, bread, 1 liter soda', 1170, 'https://talabat.dhmedia.io/image/talabat/MenuItems/mmw_638938148835883809?width=400', false),
(19653585, 'Tender Meal', '10 tenders, family fries, family coleslaw, bread, 1 liter drink', 610, 'https://talabat.dhmedia.io/image/talabat/MenuItems/mmw_638941413730277906?width=400', false),
(19653589, 'Tender Chicken Meal', '2 tender pieces, fries, bread, juice.', 140, 'https://talabat.dhmedia.io/image/talabat/MenuItems/mmw_638946579749596278?width=400', false),
(19653589, 'Kids Fried Chicken Piece', '1 fried chicken piece, French fries, bread, juice.', 140, 'https://talabat.dhmedia.io/image/talabat/MenuItems/mmw_638946579758246861?width=400', false),
(19653589, 'Kids Beef Burger Meal', 'Beef burger sandwich, French fries, juice.', 140, 'https://talabat.dhmedia.io/image/talabat/MenuItems/mmw_638946581317534858?width=400', false),
(19653589, 'Add toy', 'Add a toy with the kids'' meal.', 35, 'https://talabat.dhmedia.io/image/talabat/MenuItems/WhatsApp_Image_20250918_a638938043825906665.jpeg?width=400', false),
(19653594, 'Twister Doods', 'Crispy and tender chicken pieces with Twister Doods sauce, cheddar sauce, and lettuce, wrapped in a tortilla.', 145, 'https://talabat.dhmedia.io/image/talabat/MenuItems/WhatsApp_Image_20250918_a638938028900195085.jpeg?width=400', false),
(19653594, 'Secret De Sandwich', 'Crispy chicken breast pieces covered with American cheese, ranch sauce, buffalo sauce, mayonnaise, lettuce, and pickles.', 125, 'https://talabat.dhmedia.io/image/talabat/MenuItems/WhatsApp_Image_20250918_a638938030678468496.jpeg?width=400', false),
(19653594, 'Super Crunchy', 'Tender pieces covered with cheddar sauce, barbecue sauce, Dood''s sauce, smoked turkey, lettuce, and pickled cucumber.', 230, 'https://talabat.dhmedia.io/image/talabat/MenuItems/WhatsApp_Image_20250918_a638938029072890382.jpeg?width=400', false),
(19653594, 'T Ranch Sandwich', 'Crispy chicken breast pieces topped with smoked turkey, American cheese, ranch sauce, Dodz sauce, lettuce, and pickled cucumber.', 130, 'https://talabat.dhmedia.io/image/talabat/MenuItems/WhatsApp_Image_20260102_a639031320168568896.jpeg?width=400', false),
(19653594, 'Mighty D Sandwich', 'Crispy chicken breast pieces covered with melted American cheese, comeback sauce, fresh lettuce, and pickled cucumber.', 140, 'https://talabat.dhmedia.io/image/talabat/MenuItems/WhatsApp_Image_20260102_a639031321615002112.jpeg?width=400', false),
(19653594, 'Big Boss Sandwich', 'Crispy chicken breast with smoked turkey and mozzarella bomb, cheddar sauce, BBQ mayonnaise, lettuce, and pickles.', 150, 'https://talabat.dhmedia.io/image/talabat/MenuItems/WhatsApp_Image_20260102_a639031325595416042.jpeg?width=400', false),
(19653594, 'Hot Honey Sandwich', 'Crispy chicken breast pieces with Nashville sauce, hot honey sauce, sriracha sauce, lettuce, and pickles.', 140, 'https://talabat.dhmedia.io/image/talabat/MenuItems/WhatsApp_Image_20260102_a639031327607996261.jpeg?width=400', false),
(19653594, 'Herby Butter Sandwich', 'Crispy chicken breast pieces with spicy Nashville butter sauce, lettuce, mayonnaise, and pickled cucumber.', 130, 'https://talabat.dhmedia.io/image/talabat/MenuItems/WhatsApp_Image_20260102_a639031329193739506.jpeg?width=400', false),
(19653594, 'Cheeky Slaw Sandwich', 'Crispy chicken breast pieces with Nashville sauce, comeback slaw sauce, and pickled cucumber', 125, 'https://talabat.dhmedia.io/image/talabat/MenuItems/WhatsApp_Image_20260102_a639031330783766031.jpeg?width=400', false),
(19653594, 'Fire D Sandwich', 'Crispy chicken breast pieces topped with spicy cheddar sticks, comeback sauce, jalapeños, lettuce, and pickled cucumbers.', 145, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771286/product/1daaa2ea-80e9-4aa0-b15e-4d9eb9fc840c.jpg?width=400', false),
(19653595, 'Mushroom Honey Sandwich', 'Smash burger covered with American cheese, mushrooms, honey BBQ sauce, comeback sauce, onions, lettuce, and pickles.', 160, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/f1a59e0a-3b1e-45e6-abc3-613941c895c0.jpg?width=400', false),
(19653595, 'Truffle D Sandwich', 'Smash burger with beef bacon, emmental cheese, truffle mayonnaise, onion, and pickled cucumber.', 175, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/e5f9e2fc-782d-4597-a279-739d17dbe24c.jpg?width=400', false),
(19653595, 'Smoky D Sandwich', 'Smash burger topped with American cheese, smoky sauce, onion, lettuce, and pickled cucumber.', 165, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771283/product/1ecbe826-dfaf-4584-8272-77fbae3bf02e.jpg?width=400', false),
(19896634, 'Buffalo Ranch Chicken Wings', 'Crispy wings topped with buffalo and ranch sauce', 85, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771237/product/2579257726/8a2b0a4a-8585-419e-9222-14c1a8d4cbd1.jpg?width=400', false),
(19896634, 'Hot Honey Chicken Wings', 'Crispy chicken wing pieces coated in hot honey sauce', 85, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771286/product/9778ba83-c529-46d2-bf6f-a49bef6e6065.jpg?width=400', false),
(19896634, 'Smoked Chicken Wings', 'Crispy chicken wings pieces covered with smoky sauce', 85, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771286/product/0df8c4ce-2dd8-4a35-99c7-60196792b24e.jpg?width=400', false),
(19896634, 'Sriracha Mayo Chicken Wings', 'Crispy chicken wing pieces coated with sriracha mayonnaise sauce.', 85, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771286/product/5a289971-f07e-462a-b98d-1f033a301ec7.jpg?width=400', false),
(19653592, 'Chicken Risotto Medium', 'Risotto with strips and sauce (Tiger or BBQ), hot or regular', 70, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771286/product/b94ad029-4eeb-458c-a3a3-91f9480a586d.jpg?width=400', false),
(19653592, 'Max Platter', 'Fried mozzarella cheese with two pieces of spicy cheddar cheese, fried onion rings, and curly fries.', 215, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/817ebfd7-740c-4ebf-8ee0-bb2459e64824.jpg?width=400', false),
(19653592, 'Curly Fries', 'Plate of curly fries.', 105, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/e71dd46c-5bc7-4a0f-8385-84b54affb6d0.jpg?width=400', false),
(19653592, 'Nashville Loaded Fries', 'Fries with Dodz sauce, Nashville tender, and pickles', 145, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771283/product/3f8152e5-0e57-431e-8244-f4c7a5f093ff.jpg?width=400', false),
(19653592, 'Cheesy Fries', 'Golden fried potatoes topped with cheddar cheese sauce.', 105, 'https://talabat.dhmedia.io/image/talabat/MenuItems/mmw_638944933890527259?width=400', false),
(19653592, 'Curly Cheesy Fries', 'Curly fries covered with cheddar sauce', 145, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771237/product/2200312744/6ae1bba4-f8a1-4e68-a092-b7f107d2f3d2.jpg?width=400', false),
(19653592, 'Chicken Rizo', 'Spiced rice with chicken pieces in barbecue or Tiger sauce.', 115, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771237/product/2200312747/3673cbaa-c037-40d6-8cd2-2eb92861ae8b.jpg?width=400', false),
(19653592, 'Mac and Cheese', 'Creamy pasta covered with cheddar sauce.', 75, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/2200312749/ad2a1f26-9661-4efe-a02f-583ba525cb58.jpg?width=400', false),
(19653592, 'Chicken Mac & Cheese', 'Creamy pasta topped with cheddar sauce, ranch, and crispy chicken strips.', 130, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771237/product/2200312750/71ce5d86-5563-43ab-bfbc-c360c1197a9b.jpg?width=400', false),
(19653588, 'Hot Honey', 'Hot honey sauce cup', 40, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/b02e95a4-352e-4f94-85f3-f00a0021c538.jpg?width=400', false),
(19653588, 'Ranch', 'Ranch sauce cup', 40, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/f8d88158-e51b-4c81-bf69-03c966f64b4a.jpg?width=400', false),
(19653588, 'Sriracha Mayo', 'Sriracha mayo sauce cup', 45, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/8c2bbc06-4a2e-4bf3-825a-2e3e2b5cf67a.jpg?width=400', false),
(19653588, 'Doods', 'Doods sauce cup', 40, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/6b356ced-ea87-44d1-8de0-301c1481ee92.jpg?width=400', false),
(19653588, 'Comeback', 'Comeback sauce cup', 40, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/58c9f90d-fffe-4c7d-abe5-471f70ac46c5.jpg?width=400', false),
(19653588, 'Barbecue', 'Barbecue sauce cup', 35, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/78bddf3e-14be-4a09-b0d2-59b9f23c8919.jpg?width=400', false),
(19653588, 'Smoky', 'Smoky sauce cup', 40, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/68594202-87f3-434f-86d9-c6c682ee0ac6.jpg?width=400', false),
(19653588, 'Buffalo', 'Buffalo sauce cup', 40, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/ff88b4ed-61de-46a7-a881-5b20d7e00b32.jpg?width=400', false),
(19653588, 'Cheddar', 'Cheddar sauce cup', 45, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771283/product/157f44b2-37ff-4f16-ad89-867519b9e5af.jpg?width=400', false),
(19653588, 'Tiger', 'Tiger sauce cup', 40, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771283/product/ceda0938-9425-4722-bfff-a7013538408f.jpg?width=400', false),
(19653591, 'Brioche', 'Soft and buttery brioche bun.', 17, 'https://talabat.dhmedia.io/image/talabat/MenuItems/mmw_638943336047206091?width=400', false),
(19653591, 'Add Chicken Piece', 'Crispy chicken piece', 100, 'https://talabat.dhmedia.io/image/talabat/MenuItems/mmw_638943336112133668?width=400', false),
(19653591, 'Chicken Fillet', 'Crispy fillet piece', 100, 'https://talabat.dhmedia.io/image/talabat/MenuItems/mmw_638946582330610512?width=400', false),
(19653591, 'Tender Chicken', 'Crispy tender chicken', 75, 'https://talabat.dhmedia.io/image/talabat/MenuItems/mmw_638946582821151041?width=400', false),
(19653591, 'Large Plain Risotto', 'A generous portion of seasoned plain risotto', 50, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771237/product/2301413912/778b85ce-f630-448c-a684-985db6c45ad5.jpg?width=400', false),
(19653591, 'Coleslaw', 'Fresh coleslaw', 40, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/1d50f8f8-9cd8-4819-959a-9e94c515b845.jpg?width=400', false),
(19653591, 'Fries', 'Crispy golden fries', 45, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/2a7ac851-b95e-49f5-a588-0c379d62e941.jpg?width=400', false),
(19653591, 'Mozzarella Bomb', 'Piece of mozzarella bomb', 75, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771237/product/71bce1a5-323b-49e0-833b-5d0f52860eec.jpg?width=400', false),
(19653591, 'Cheddar Sticks', 'Box of three spicy cheddar sticks.', 75, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771283/product/f334924b-0f9b-4517-9280-cd6dc4c908e9.jpg?width=400', false),
(19653593, 'Water', 'Bottled drinking water', 15, 'https://talabat.dhmedia.io/image/talabat/MenuItems/WhatsApp_Image_20250918_a638938043157873854.jpeg?width=400', false),
(19653593, 'Fi Cola', 'Soft drink.', 35, 'https://talabat.dhmedia.io/image/talabat/MenuItems/WhatsApp_Image_20250918_a638938043011836257.jpeg?width=400', false),
(19653593, 'Apple Juice', 'Fresh apple juice.', 25, 'https://talabat.dhmedia.io/image/talabat/MenuItems/WhatsApp_Image_20250918_a638938042848143761.jpeg?width=400', false),
(19653593, '1 Liter Maxi Drink', 'Large 1 liter soft drink', 50, 'https://talabat.dhmedia.io/image/talabat/MenuItems/mmw_638938074328282749?width=400', false)
) AS v(category_id, name, description, price, image, is_customizable)
WHERE NOT EXISTS (
    SELECT 1 FROM products p
     WHERE p.category_id = v.category_id
       AND p.name = v.name
       AND p.price = v.price
       AND p.is_modifier = false
       AND p.is_deleted = false
);

-- Build Your Own Burger. Not in the imported menu export, so it is seeded here to
-- give the burger category a full customization example.
INSERT INTO products (category_id, name, description, price, image, is_deleted, is_available, is_customizable)
SELECT 19653595,
       'Build Your Own Burger',
       'Your burger, your rules: pick your main, bun, cheese, up to five toppings, your sauce and extras.',
       95,
       'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/f1a59e0a-3b1e-45e6-abc3-613941c895c0.jpg?width=400',
       false,
       true,
       false
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Build Your Own Burger' AND is_deleted = false);


-- 2. Hidden modifier products. Each customizer value points at one of these via
--    option_values.modifier_product_id so an admin can see and restock the real
--    ingredient. is_modifier keeps them out of the storefront and product grid, and
--    their own price is never charged: the option value's price_delta is the only
--    price authority.
--
--    products.category_id is NOT NULL, so every modifier needs one. They all live
--    under "Add Ons" purely to satisfy the FK — is_modifier is what actually keeps
--    them out of the storefront and the admin product grid.
INSERT INTO products (category_id, name, description, price, image, is_available, is_modifier)
SELECT 19653591, v.name, v.description, v.price, v.image, true, true
FROM (VALUES
    ('Hot Honey Cup', 'Hot honey sauce cup', 22.00, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/b02e95a4-352e-4f94-85f3-f00a0021c538.jpg?width=400'),
    ('Smoked Turkey', 'Smoked turkey slices', 25.00, 'https://talabat.dhmedia.io/image/talabat/MenuItems/WhatsApp_Image_20260102_a639031320168568896.jpeg?width=400'),
    ('Pickled Cucumbers', 'Crunchy pickled cucumber slices', 8.00, 'https://talabat.dhmedia.io/image/talabat/MenuItems/WhatsApp_Image_20260102_a639031321615002112.jpeg?width=400'),
    ('Crispy Fillet', 'Crispy chicken fillet piece', 50.00, 'https://talabat.dhmedia.io/image/talabat/MenuItems/mmw_638946582330610512?width=400'),
    ('Barbecue Sauce Cup', 'Barbecue sauce cup', 18.00, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/6d95cb47-3ce4-4938-8dd5-a5d8e563c4fc.jpg?width=400'),
    ('Whole Wheat Bun', 'Toasted whole wheat bun', 12.00, 'https://talabat.dhmedia.io/image/talabat/MenuItems/mmw_638943336047206091?width=400'),
    ('Potato Bun', 'Soft potato bun', 12.00, 'https://talabat.dhmedia.io/image/talabat/MenuItems/mmw_638943336047206091?width=400'),
    ('Extra Cheddar', 'Melted cheddar cheese slice', 15.00, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771283/product/33567da1-e64a-475d-881b-011e640563f6.jpg?width=400'),
    ('Sriracha Mayo Cup', 'Sriracha mayo cup', 22.00, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/8c2bbc06-4a2e-4bf3-825a-2e3e2b5cf67a.jpg?width=400'),
    ('Fried Onion Rings', 'Crispy fried onion rings', 25.00, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/817ebfd7-740c-4ebf-8ee0-bb2459e64824.jpg?width=400'),
    ('Buffalo Sauce Cup', 'Buffalo sauce cup', 20.00, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/ff88b4ed-61de-46a7-a881-5b20d7e00b32.jpg?width=400'),
    ('Grilled Mushrooms', 'Grilled button mushrooms', 20.00, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/f1a59e0a-3b1e-45e6-abc3-613941c895c0.jpg?width=400'),
    ('Beef Patty', 'Smashed 100% beef patty', 60.00, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771283/product/1ecbe826-dfaf-4584-8272-77fbae3bf02e.jpg?width=400'),
    ('Smoky Sauce Cup', 'Smoky sauce cup', 20.00, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/68594202-87f3-434f-86d9-c6c682ee0ac6.jpg?width=400'),
    ('Jalapenos', 'Sliced jalapenos', 10.00, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771286/product/1daaa2ea-80e9-4aa0-b15e-4d9eb9fc840c.jpg?width=400'),
    ('Nashville Tender', 'Nashville hot tender strip', 65.00, 'https://talabat.dhmedia.io/image/talabat/MenuItems/mmw_638946582821151041?width=400'),
    ('Crisp Lettuce', 'Fresh crisp lettuce', 8.00, 'https://talabat.dhmedia.io/image/talabat/MenuItems/WhatsApp_Image_20260102_a639031321615002112.jpeg?width=400'),
    ('Ranch Cup', 'Ranch dressing cup', 20.00, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/f8d88158-e51b-4c81-bf69-03c966f64b4a.jpg?width=400'),
    ('Extra American Cheese', 'Melted American cheese slice', 15.00, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/817ebfd7-740c-4ebf-8ee0-bb2459e64824.jpg?width=400'),
    ('Extra Crispy Tender', 'Extra crispy chicken tender', 85.00, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771283/product/7028a4a9-c2e3-4cd3-95d2-6cdf3cc6238b.jpg?width=400'),
    ('Tiger Sauce Cup', 'Tiger sauce cup', 20.00, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771283/product/ceda0938-9425-4722-bfff-a7013538408f.jpg?width=400'),
    ('Extra Nashville Tender', 'Extra Nashville tender', 95.00, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771283/product/3f8152e5-0e57-431e-8244-f4c7a5f093ff.jpg?width=400'),
    ('Doods Sauce Cup', 'Doods sauce cup', 20.00, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/6b356ced-ea87-44d1-8de0-301c1481ee92.jpg?width=400'),
    ('Extra Mozzarella', 'Melted mozzarella slice', 20.00, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771237/product/71bce1a5-323b-49e0-833b-5d0f52860eec.jpg?width=400'),
    ('Comeback Sauce Cup', 'Comeback sauce cup', 20.00, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/db641c1d-1022-4529-8bed-66b72033adf0.jpg?width=400'),
    ('Toasted Brioche Bun', 'Toasted soft brioche bun', 12.00, 'https://talabat.dhmedia.io/image/talabat/MenuItems/mmw_638943336047206091?width=400'),
    ('Coleslaw', 'Fresh DODZ coleslaw', 20.00, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/0a9d44c7-701a-444d-911e-8dabaebc5789.jpg?width=400')
) AS v(name, description, price, image)
WHERE NOT EXISTS (
    SELECT 1 FROM products p WHERE p.name = v.name AND p.is_modifier = true
);

-- 3. Option trees. price_delta is the price authority; "modifier" links the value
--    to the hidden ingredient product above. Radio groups are pinned to max 1.
--
--    Every tree below mirrors the live Talabat menu (branch 771285, Dodz
--    Heliopolis): sandwich sizes, Make It Combo, bundle sandwich picks,
--    Original/Spicy chicken-type picks, and the required Size radios that replace
--    the old small/medium/family product rows. Meals keep counted piece-mix pairs
--    (one pair per meat for mixed meals) instead of Talabat's single pick.
--    Build Your Own Burger is the one exception: an admin product, not on Talabat.
--
--    Two shapes are supported by the loader below:
--      * radio / checkbox - ordinary picks, selection validated in resolveSelection.
--      * quantity        - a counted split. Two groups are linked to each other and
--                           share linked_total; the server rejects the request unless
--                           the two counts add up to that total. "linked_to_index"
--                           is loader-only: neither half has an id yet, so links are
--                           wired in a second pass once both rows exist.
DO $seed$
DECLARE
    v_def JSONB;
    v_group JSONB;
    v_value JSONB;
    v_product_id INTEGER;
    v_option_id INTEGER;
    v_option_ids INTEGER[] := '{}';
    v_link RECORD;
BEGIN
    FOR v_def IN
        SELECT * FROM jsonb_array_elements($json$
        [
          {
            "product": "Solo Crave",
            "groups": [
              {
                "name": "Choose Your Sandwich",
                "type": "radio",
                "is_required": true,
                "min_selections": 1,
                "max_selections": 1,
                "sort_order": 1,
                "values": [
                  {
                    "name": "Secret De Sandwich",
                    "price_delta": 0,
                    "sort_order": 1
                  },
                  {
                    "name": "Fire D Sandwich",
                    "price_delta": 0,
                    "sort_order": 2
                  },
                  {
                    "name": "T Ranch Sandwich",
                    "price_delta": 0,
                    "sort_order": 3
                  },
                  {
                    "name": "Mighty D Sandwich",
                    "price_delta": 0,
                    "sort_order": 4
                  },
                  {
                    "name": "Big Boss Sandwich",
                    "price_delta": 0,
                    "sort_order": 5
                  },
                  {
                    "name": "Hot Honey Sandwich",
                    "price_delta": 0,
                    "sort_order": 6
                  },
                  {
                    "name": "Herby Butter Sandwich",
                    "price_delta": 0,
                    "sort_order": 7
                  },
                  {
                    "name": "Cheeky Slaw Sandwich",
                    "price_delta": 0,
                    "sort_order": 8
                  },
                  {
                    "name": "Mushroom Honey Sandwich",
                    "price_delta": 0,
                    "sort_order": 9
                  },
                  {
                    "name": "Smoky D Sandwich",
                    "price_delta": 0,
                    "sort_order": 10
                  },
                  {
                    "name": "Truffle D Sandwich",
                    "price_delta": 0,
                    "sort_order": 11
                  }
                ]
              }
            ]
          },
          {
            "product": "Double Dip",
            "groups": [
              {
                "name": "Choose 2 Sandwiches",
                "type": "checkbox",
                "is_required": true,
                "min_selections": 2,
                "max_selections": 2,
                "sort_order": 1,
                "values": [
                  {
                    "name": "Secret De Sandwich",
                    "price_delta": 0,
                    "sort_order": 1
                  },
                  {
                    "name": "Fire D Sandwich",
                    "price_delta": 0,
                    "sort_order": 2
                  },
                  {
                    "name": "T Ranch Sandwich",
                    "price_delta": 0,
                    "sort_order": 3
                  },
                  {
                    "name": "Mighty D Sandwich",
                    "price_delta": 0,
                    "sort_order": 4
                  },
                  {
                    "name": "Big Boss Sandwich",
                    "price_delta": 0,
                    "sort_order": 5
                  },
                  {
                    "name": "Hot Honey Sandwich",
                    "price_delta": 0,
                    "sort_order": 6
                  },
                  {
                    "name": "Herby Butter Sandwich",
                    "price_delta": 0,
                    "sort_order": 7
                  },
                  {
                    "name": "Cheeky Slaw Sandwich",
                    "price_delta": 0,
                    "sort_order": 8
                  },
                  {
                    "name": "Mushroom Honey Sandwich",
                    "price_delta": 0,
                    "sort_order": 9
                  },
                  {
                    "name": "Smoky D Sandwich",
                    "price_delta": 0,
                    "sort_order": 10
                  },
                  {
                    "name": "Truffle D Sandwich",
                    "price_delta": 0,
                    "sort_order": 11
                  }
                ]
              }
            ]
          },
          {
            "product": "Festival Box",
            "groups": [
              {
                "name": "Festival Sandwiches",
                "type": "checkbox",
                "is_required": true,
                "min_selections": 2,
                "max_selections": 2,
                "sort_order": 1,
                "values": [
                  {
                    "name": "Secret De Sandwich",
                    "price_delta": 0,
                    "sort_order": 1
                  },
                  {
                    "name": "Fire D Sandwich",
                    "price_delta": 0,
                    "sort_order": 2
                  },
                  {
                    "name": "T Ranch Sandwich",
                    "price_delta": 0,
                    "sort_order": 3
                  },
                  {
                    "name": "Mighty D Sandwich",
                    "price_delta": 0,
                    "sort_order": 4
                  },
                  {
                    "name": "Big Boss Sandwich",
                    "price_delta": 0,
                    "sort_order": 5
                  },
                  {
                    "name": "Hot Honey Sandwich",
                    "price_delta": 0,
                    "sort_order": 6
                  },
                  {
                    "name": "Herby Butter Sandwich",
                    "price_delta": 0,
                    "sort_order": 7
                  },
                  {
                    "name": "Cheeky Slaw Sandwich",
                    "price_delta": 0,
                    "sort_order": 8
                  },
                  {
                    "name": "Mushroom Honey Sandwich",
                    "price_delta": 0,
                    "sort_order": 9
                  },
                  {
                    "name": "Smoky D Sandwich",
                    "price_delta": 0,
                    "sort_order": 10
                  },
                  {
                    "name": "Truffle D Sandwich",
                    "price_delta": 0,
                    "sort_order": 11
                  }
                ]
              }
            ]
          },
          {
            "product": "Nashy",
            "groups": [
              {
                "name": "Nashy Sandwiches",
                "type": "checkbox",
                "is_required": true,
                "min_selections": 2,
                "max_selections": 2,
                "sort_order": 1,
                "values": [
                  {
                    "name": "Hot Honey Sandwich",
                    "price_delta": 0,
                    "sort_order": 1
                  },
                  {
                    "name": "Herby Butter Sandwich",
                    "price_delta": 0,
                    "sort_order": 2
                  },
                  {
                    "name": "Cheeky Slaw Sandwich",
                    "price_delta": 0,
                    "sort_order": 3
                  }
                ]
              }
            ]
          },
          {
            "product": "T Ranch Sandwich",
            "groups": [
              {
                "name": "Size",
                "type": "radio",
                "is_required": true,
                "min_selections": 1,
                "max_selections": 1,
                "sort_order": 1,
                "values": [
                  {
                    "name": "Single",
                    "price_delta": 0,
                    "sort_order": 1,
                    "is_default": true
                  },
                  {
                    "name": "Double",
                    "price_delta": 75,
                    "sort_order": 2
                  }
                ]
              }
            ]
          },
          {
            "product": "Mighty D Sandwich",
            "groups": [
              {
                "name": "Size",
                "type": "radio",
                "is_required": true,
                "min_selections": 1,
                "max_selections": 1,
                "sort_order": 1,
                "values": [
                  {
                    "name": "Single",
                    "price_delta": 0,
                    "sort_order": 1,
                    "is_default": true
                  }
                ]
              }
            ]
          },
          {
            "product": "Big Boss Sandwich",
            "groups": [
              {
                "name": "Size",
                "type": "radio",
                "is_required": true,
                "min_selections": 1,
                "max_selections": 1,
                "sort_order": 1,
                "values": [
                  {
                    "name": "Single",
                    "price_delta": 0,
                    "sort_order": 1,
                    "is_default": true
                  },
                  {
                    "name": "Double",
                    "price_delta": 70,
                    "sort_order": 2
                  }
                ]
              }
            ]
          },
          {
            "product": "Hot Honey Sandwich",
            "groups": [
              {
                "name": "Size",
                "type": "radio",
                "is_required": true,
                "min_selections": 1,
                "max_selections": 1,
                "sort_order": 1,
                "values": [
                  {
                    "name": "Single",
                    "price_delta": 0,
                    "sort_order": 1,
                    "is_default": true
                  },
                  {
                    "name": "Double",
                    "price_delta": 70,
                    "sort_order": 2
                  }
                ]
              }
            ]
          },
          {
            "product": "Herby Butter Sandwich",
            "groups": [
              {
                "name": "Size",
                "type": "radio",
                "is_required": true,
                "min_selections": 1,
                "max_selections": 1,
                "sort_order": 1,
                "values": [
                  {
                    "name": "Single",
                    "price_delta": 0,
                    "sort_order": 1,
                    "is_default": true
                  },
                  {
                    "name": "Double",
                    "price_delta": 65,
                    "sort_order": 2
                  }
                ]
              }
            ]
          },
          {
            "product": "Cheeky Slaw Sandwich",
            "groups": [
              {
                "name": "Size",
                "type": "radio",
                "is_required": true,
                "min_selections": 1,
                "max_selections": 1,
                "sort_order": 1,
                "values": [
                  {
                    "name": "Single",
                    "price_delta": 0,
                    "sort_order": 1,
                    "is_default": true
                  },
                  {
                    "name": "Double",
                    "price_delta": 75,
                    "sort_order": 2
                  }
                ]
              }
            ]
          },
          {
            "product": "Fire D Sandwich",
            "groups": [
              {
                "name": "Size",
                "type": "radio",
                "is_required": true,
                "min_selections": 1,
                "max_selections": 1,
                "sort_order": 1,
                "values": [
                  {
                    "name": "Single",
                    "price_delta": 0,
                    "sort_order": 1,
                    "is_default": true
                  },
                  {
                    "name": "Double",
                    "price_delta": 75,
                    "sort_order": 2
                  }
                ]
              }
            ]
          },
          {
            "product": "Secret De Sandwich",
            "groups": [
              {
                "name": "Size",
                "type": "radio",
                "is_required": true,
                "min_selections": 1,
                "max_selections": 1,
                "sort_order": 1,
                "values": [
                  {
                    "name": "Single",
                    "price_delta": 0,
                    "sort_order": 1,
                    "is_default": true
                  }
                ]
              },
              {
                "name": "Make It Combo",
                "type": "checkbox",
                "is_required": false,
                "min_selections": 0,
                "max_selections": 2,
                "sort_order": 2,
                "values": [
                  {
                    "name": "Fries + V Cola",
                    "description": "Regular fries and a V Cola",
                    "price_delta": 75,
                    "sort_order": 1
                  },
                  {
                    "name": "Add Slice of Cheese",
                    "price_delta": 22,
                    "sort_order": 2,
                    "modifier": "Extra American Cheese"
                  }
                ]
              }
            ]
          },
          {
            "product": "Super Crunchy",
            "groups": [
              {
                "name": "Taste",
                "type": "radio",
                "is_required": true,
                "min_selections": 1,
                "max_selections": 1,
                "sort_order": 1,
                "values": [
                  {
                    "name": "Original",
                    "price_delta": 0,
                    "sort_order": 1,
                    "is_default": true
                  },
                  {
                    "name": "Spicy",
                    "price_delta": 0,
                    "sort_order": 2
                  }
                ]
              },
              {
                "name": "Make It Combo",
                "type": "checkbox",
                "is_required": false,
                "min_selections": 0,
                "max_selections": 2,
                "sort_order": 2,
                "values": [
                  {
                    "name": "Fries + V Cola",
                    "description": "Regular fries and a V Cola",
                    "price_delta": 75,
                    "sort_order": 1
                  },
                  {
                    "name": "Add Slice of Cheese",
                    "price_delta": 22,
                    "sort_order": 2,
                    "modifier": "Extra American Cheese"
                  }
                ]
              }
            ]
          },
          {
            "product": "Twister Doods",
            "groups": [
              {
                "name": "Sauce",
                "type": "radio",
                "is_required": true,
                "min_selections": 1,
                "max_selections": 1,
                "sort_order": 1,
                "values": [
                  {
                    "name": "Original",
                    "price_delta": 0,
                    "sort_order": 1,
                    "is_default": true
                  },
                  {
                    "name": "Spicy Tiger Sauce",
                    "price_delta": 0,
                    "sort_order": 2
                  },
                  {
                    "name": "Spicy Siracha Sauce",
                    "price_delta": 0,
                    "sort_order": 3
                  }
                ]
              },
              {
                "name": "Make It Combo",
                "type": "checkbox",
                "is_required": false,
                "min_selections": 0,
                "max_selections": 2,
                "sort_order": 2,
                "values": [
                  {
                    "name": "Fries + V Cola",
                    "description": "Regular fries and a V Cola",
                    "price_delta": 75,
                    "sort_order": 1
                  },
                  {
                    "name": "Add Slice of Cheese",
                    "price_delta": 22,
                    "sort_order": 2,
                    "modifier": "Extra American Cheese"
                  }
                ]
              }
            ]
          },
          {
            "product": "Mushroom Honey Sandwich",
            "groups": [
              {
                "name": "Taste",
                "type": "radio",
                "is_required": true,
                "min_selections": 1,
                "max_selections": 1,
                "sort_order": 1,
                "values": [
                  {
                    "name": "Regular",
                    "price_delta": 0,
                    "sort_order": 1,
                    "is_default": true
                  },
                  {
                    "name": "Spicy",
                    "price_delta": 0,
                    "sort_order": 2
                  }
                ]
              },
              {
                "name": "Size",
                "type": "radio",
                "is_required": true,
                "min_selections": 1,
                "max_selections": 1,
                "sort_order": 2,
                "values": [
                  {
                    "name": "Single",
                    "price_delta": 0,
                    "sort_order": 1,
                    "is_default": true
                  },
                  {
                    "name": "Double",
                    "price_delta": 45,
                    "sort_order": 2
                  },
                  {
                    "name": "Triple",
                    "price_delta": 95,
                    "sort_order": 3
                  }
                ]
              }
            ]
          },
          {
            "product": "Truffle D Sandwich",
            "groups": [
              {
                "name": "Size",
                "type": "radio",
                "is_required": true,
                "min_selections": 1,
                "max_selections": 1,
                "sort_order": 1,
                "values": [
                  {
                    "name": "Single",
                    "price_delta": 0,
                    "sort_order": 1,
                    "is_default": true
                  },
                  {
                    "name": "Double",
                    "price_delta": 60,
                    "sort_order": 2
                  },
                  {
                    "name": "Triple",
                    "price_delta": 105,
                    "sort_order": 3
                  }
                ]
              }
            ]
          },
          {
            "product": "Smoky D Sandwich",
            "groups": [
              {
                "name": "Size",
                "type": "radio",
                "is_required": true,
                "min_selections": 1,
                "max_selections": 1,
                "sort_order": 1,
                "values": [
                  {
                    "name": "Single",
                    "price_delta": 0,
                    "sort_order": 1,
                    "is_default": true
                  },
                  {
                    "name": "Double",
                    "price_delta": 45,
                    "sort_order": 2
                  },
                  {
                    "name": "Triple",
                    "price_delta": 90,
                    "sort_order": 3
                  }
                ]
              }
            ]
          },
          {
            "product": "Add Chicken Piece",
            "groups": [
              {
                "name": "Choose The Type",
                "type": "radio",
                "is_required": true,
                "min_selections": 1,
                "max_selections": 1,
                "sort_order": 1,
                "values": [
                  {
                    "name": "Original",
                    "price_delta": 0,
                    "sort_order": 1
                  },
                  {
                    "name": "Spicy",
                    "price_delta": 0,
                    "sort_order": 2
                  }
                ]
              }
            ]
          },
          {
            "product": "Fries",
            "groups": [
              {
                "name": "Size",
                "type": "radio",
                "is_required": true,
                "min_selections": 1,
                "max_selections": 1,
                "sort_order": 1,
                "values": [
                  {
                    "name": "Small",
                    "price_delta": 0,
                    "sort_order": 1,
                    "is_default": true
                  },
                  {
                    "name": "Medium",
                    "price_delta": 20,
                    "sort_order": 2
                  },
                  {
                    "name": "Family",
                    "price_delta": 55,
                    "sort_order": 3
                  }
                ]
              }
            ]
          },
          {
            "product": "Coleslaw",
            "groups": [
              {
                "name": "Size",
                "type": "radio",
                "is_required": true,
                "min_selections": 1,
                "max_selections": 1,
                "sort_order": 1,
                "values": [
                  {
                    "name": "Small",
                    "price_delta": 0,
                    "sort_order": 1,
                    "is_default": true
                  },
                  {
                    "name": "Medium",
                    "price_delta": 10,
                    "sort_order": 2
                  },
                  {
                    "name": "Family",
                    "price_delta": 50,
                    "sort_order": 3
                  }
                ]
              }
            ]
          },
          {
            "product": "Hot Honey",
            "groups": [
              {
                "name": "Size",
                "type": "radio",
                "is_required": true,
                "min_selections": 1,
                "max_selections": 1,
                "sort_order": 1,
                "values": [
                  {
                    "name": "Small",
                    "price_delta": 0,
                    "sort_order": 1,
                    "is_default": true
                  },
                  {
                    "name": "Large",
                    "price_delta": 30,
                    "sort_order": 2
                  }
                ]
              }
            ]
          },
          {
            "product": "Ranch",
            "groups": [
              {
                "name": "Size",
                "type": "radio",
                "is_required": true,
                "min_selections": 1,
                "max_selections": 1,
                "sort_order": 1,
                "values": [
                  {
                    "name": "Small",
                    "price_delta": 0,
                    "sort_order": 1,
                    "is_default": true
                  },
                  {
                    "name": "Large",
                    "price_delta": 25,
                    "sort_order": 2
                  }
                ]
              }
            ]
          },
          {
            "product": "Sriracha Mayo",
            "groups": [
              {
                "name": "Size",
                "type": "radio",
                "is_required": true,
                "min_selections": 1,
                "max_selections": 1,
                "sort_order": 1,
                "values": [
                  {
                    "name": "Small",
                    "price_delta": 0,
                    "sort_order": 1,
                    "is_default": true
                  },
                  {
                    "name": "Large",
                    "price_delta": 20,
                    "sort_order": 2
                  }
                ]
              }
            ]
          },
          {
            "product": "Doods",
            "groups": [
              {
                "name": "Size",
                "type": "radio",
                "is_required": true,
                "min_selections": 1,
                "max_selections": 1,
                "sort_order": 1,
                "values": [
                  {
                    "name": "Small",
                    "price_delta": 0,
                    "sort_order": 1,
                    "is_default": true
                  },
                  {
                    "name": "Large",
                    "price_delta": 30,
                    "sort_order": 2
                  }
                ]
              }
            ]
          },
          {
            "product": "Comeback",
            "groups": [
              {
                "name": "Size",
                "type": "radio",
                "is_required": true,
                "min_selections": 1,
                "max_selections": 1,
                "sort_order": 1,
                "values": [
                  {
                    "name": "Small",
                    "price_delta": 0,
                    "sort_order": 1,
                    "is_default": true
                  },
                  {
                    "name": "Large",
                    "price_delta": 30,
                    "sort_order": 2
                  }
                ]
              }
            ]
          },
          {
            "product": "Barbecue",
            "groups": [
              {
                "name": "Size",
                "type": "radio",
                "is_required": true,
                "min_selections": 1,
                "max_selections": 1,
                "sort_order": 1,
                "values": [
                  {
                    "name": "Small",
                    "price_delta": 0,
                    "sort_order": 1,
                    "is_default": true
                  },
                  {
                    "name": "Large",
                    "price_delta": 20,
                    "sort_order": 2
                  }
                ]
              }
            ]
          },
          {
            "product": "Smoky",
            "groups": [
              {
                "name": "Size",
                "type": "radio",
                "is_required": true,
                "min_selections": 1,
                "max_selections": 1,
                "sort_order": 1,
                "values": [
                  {
                    "name": "Small",
                    "price_delta": 0,
                    "sort_order": 1,
                    "is_default": true
                  },
                  {
                    "name": "Large",
                    "price_delta": 25,
                    "sort_order": 2
                  }
                ]
              }
            ]
          },
          {
            "product": "Buffalo",
            "groups": [
              {
                "name": "Size",
                "type": "radio",
                "is_required": true,
                "min_selections": 1,
                "max_selections": 1,
                "sort_order": 1,
                "values": [
                  {
                    "name": "Small",
                    "price_delta": 0,
                    "sort_order": 1,
                    "is_default": true
                  },
                  {
                    "name": "Large",
                    "price_delta": 25,
                    "sort_order": 2
                  }
                ]
              }
            ]
          },
          {
            "product": "Cheddar",
            "groups": [
              {
                "name": "Size",
                "type": "radio",
                "is_required": true,
                "min_selections": 1,
                "max_selections": 1,
                "sort_order": 1,
                "values": [
                  {
                    "name": "Small",
                    "price_delta": 0,
                    "sort_order": 1,
                    "is_default": true
                  },
                  {
                    "name": "Large",
                    "price_delta": 25,
                    "sort_order": 2
                  }
                ]
              }
            ]
          },
          {
            "product": "Tiger",
            "groups": [
              {
                "name": "Size",
                "type": "radio",
                "is_required": true,
                "min_selections": 1,
                "max_selections": 1,
                "sort_order": 1,
                "values": [
                  {
                    "name": "Small",
                    "price_delta": 0,
                    "sort_order": 1,
                    "is_default": true
                  },
                  {
                    "name": "Large",
                    "price_delta": 25,
                    "sort_order": 2
                  }
                ]
              }
            ]
          },
          {
            "product": "Buffalo Ranch Chicken Wings",
            "groups": [
              {
                "name": "Size",
                "type": "radio",
                "is_required": true,
                "min_selections": 1,
                "max_selections": 1,
                "sort_order": 1,
                "values": [
                  {
                    "name": "4 Pieces",
                    "price_delta": 0,
                    "sort_order": 1,
                    "is_default": true
                  },
                  {
                    "name": "6 Pieces",
                    "price_delta": 30,
                    "sort_order": 2
                  }
                ]
              }
            ]
          },
          {
            "product": "Hot Honey Chicken Wings",
            "groups": [
              {
                "name": "Size",
                "type": "radio",
                "is_required": true,
                "min_selections": 1,
                "max_selections": 1,
                "sort_order": 1,
                "values": [
                  {
                    "name": "4 Pieces",
                    "price_delta": 0,
                    "sort_order": 1,
                    "is_default": true
                  },
                  {
                    "name": "6 Pieces",
                    "price_delta": 30,
                    "sort_order": 2
                  }
                ]
              }
            ]
          },
          {
            "product": "Smoked Chicken Wings",
            "groups": [
              {
                "name": "Size",
                "type": "radio",
                "is_required": true,
                "min_selections": 1,
                "max_selections": 1,
                "sort_order": 1,
                "values": [
                  {
                    "name": "4 Pieces",
                    "price_delta": 0,
                    "sort_order": 1,
                    "is_default": true
                  },
                  {
                    "name": "6 Pieces",
                    "price_delta": 30,
                    "sort_order": 2
                  }
                ]
              }
            ]
          },
          {
            "product": "Sriracha Mayo Chicken Wings",
            "groups": [
              {
                "name": "Size",
                "type": "radio",
                "is_required": true,
                "min_selections": 1,
                "max_selections": 1,
                "sort_order": 1,
                "values": [
                  {
                    "name": "4 Pieces",
                    "price_delta": 0,
                    "sort_order": 1,
                    "is_default": true
                  },
                  {
                    "name": "6 Pieces",
                    "price_delta": 30,
                    "sort_order": 2
                  }
                ]
              }
            ]
          },
          {
            "product": "Chicken Risotto Medium",
            "groups": [
              {
                "name": "Chicken Type",
                "type": "radio",
                "is_required": true,
                "min_selections": 1,
                "max_selections": 1,
                "sort_order": 1,
                "values": [
                  {
                    "name": "Spicy",
                    "price_delta": 0,
                    "sort_order": 1
                  },
                  {
                    "name": "Original",
                    "price_delta": 0,
                    "sort_order": 2,
                    "is_default": true
                  }
                ]
              }
            ]
          },
          {
            "product": "Nashville Loaded Fries",
            "groups": [
              {
                "name": "Taste",
                "type": "radio",
                "is_required": true,
                "min_selections": 1,
                "max_selections": 1,
                "sort_order": 1,
                "values": [
                  {
                    "name": "Original",
                    "price_delta": 0,
                    "sort_order": 1,
                    "is_default": true
                  },
                  {
                    "name": "Spicy",
                    "price_delta": 0,
                    "sort_order": 2
                  }
                ]
              }
            ]
          },
          {
            "product": "Chicken Rizo",
            "groups": [
              {
                "name": "Sauce",
                "type": "radio",
                "is_required": true,
                "min_selections": 1,
                "max_selections": 1,
                "sort_order": 1,
                "values": [
                  {
                    "name": "BBQ (Original)",
                    "price_delta": 0,
                    "sort_order": 1,
                    "is_default": true
                  },
                  {
                    "name": "Tiger (Spicy)",
                    "price_delta": 0,
                    "sort_order": 2
                  }
                ]
              }
            ]
          },
          {
            "product": "Chicken Fillet",
            "groups": [
              {
                "name": "Your Choice Of",
                "type": "radio",
                "is_required": true,
                "min_selections": 1,
                "max_selections": 1,
                "sort_order": 1,
                "values": [
                  {
                    "name": "Regular",
                    "price_delta": 0,
                    "sort_order": 1,
                    "is_default": true
                  },
                  {
                    "name": "Spicy",
                    "price_delta": 0,
                    "sort_order": 2
                  }
                ]
              }
            ]
          },
          {
            "product": "Tender Chicken",
            "groups": [
              {
                "name": "Your Choice Of",
                "type": "radio",
                "is_required": true,
                "min_selections": 1,
                "max_selections": 1,
                "sort_order": 1,
                "values": [
                  {
                    "name": "Regular",
                    "price_delta": 0,
                    "sort_order": 1,
                    "is_default": true
                  },
                  {
                    "name": "Spicy",
                    "price_delta": 0,
                    "sort_order": 2
                  }
                ]
              }
            ]
          },
          {
            "product": "Doodz Snack",
            "groups": [
              {
                "name": "Original Pieces",
                "type": "quantity",
                "is_required": true,
                "min_selections": 0,
                "max_selections": null,
                "linked_total": 2,
                "linked_to_index": 1,
                "unit_label": "pieces",
                "sort_order": 1,
                "values": [
                  {
                    "name": "Original",
                    "price_delta": 0,
                    "sort_order": 1
                  }
                ]
              },
              {
                "name": "Spicy Pieces",
                "type": "quantity",
                "is_required": true,
                "min_selections": 0,
                "max_selections": null,
                "linked_total": 2,
                "linked_to_index": 0,
                "unit_label": "pieces",
                "sort_order": 2,
                "values": [
                  {
                    "name": "Spicy",
                    "price_delta": 0,
                    "sort_order": 1
                  }
                ]
              }
            ]
          },
          {
            "product": "Doodz Diner",
            "groups": [
              {
                "name": "Original Pieces",
                "type": "quantity",
                "is_required": true,
                "min_selections": 0,
                "max_selections": null,
                "linked_total": 3,
                "linked_to_index": 1,
                "unit_label": "pieces",
                "sort_order": 1,
                "values": [
                  {
                    "name": "Original",
                    "price_delta": 0,
                    "sort_order": 1
                  }
                ]
              },
              {
                "name": "Spicy Pieces",
                "type": "quantity",
                "is_required": true,
                "min_selections": 0,
                "max_selections": null,
                "linked_total": 3,
                "linked_to_index": 0,
                "unit_label": "pieces",
                "sort_order": 2,
                "values": [
                  {
                    "name": "Spicy",
                    "price_delta": 0,
                    "sort_order": 1
                  }
                ]
              }
            ]
          },
          {
            "product": "Family Meal",
            "groups": [
              {
                "name": "Original Pieces",
                "type": "quantity",
                "is_required": true,
                "min_selections": 0,
                "max_selections": null,
                "linked_total": 8,
                "linked_to_index": 1,
                "unit_label": "pieces",
                "sort_order": 1,
                "values": [
                  {
                    "name": "Original",
                    "price_delta": 0,
                    "sort_order": 1
                  }
                ]
              },
              {
                "name": "Spicy Pieces",
                "type": "quantity",
                "is_required": true,
                "min_selections": 0,
                "max_selections": null,
                "linked_total": 8,
                "linked_to_index": 0,
                "unit_label": "pieces",
                "sort_order": 2,
                "values": [
                  {
                    "name": "Spicy",
                    "price_delta": 0,
                    "sort_order": 1
                  }
                ]
              }
            ]
          },
          {
            "product": "Star Meal",
            "groups": [
              {
                "name": "Original Pieces",
                "type": "quantity",
                "is_required": true,
                "min_selections": 0,
                "max_selections": null,
                "linked_total": 12,
                "linked_to_index": 1,
                "unit_label": "pieces",
                "sort_order": 1,
                "values": [
                  {
                    "name": "Original",
                    "price_delta": 0,
                    "sort_order": 1
                  }
                ]
              },
              {
                "name": "Spicy Pieces",
                "type": "quantity",
                "is_required": true,
                "min_selections": 0,
                "max_selections": null,
                "linked_total": 12,
                "linked_to_index": 0,
                "unit_label": "pieces",
                "sort_order": 2,
                "values": [
                  {
                    "name": "Spicy",
                    "price_delta": 0,
                    "sort_order": 1
                  }
                ]
              }
            ]
          },
          {
            "product": "Mega Star Family Meal",
            "groups": [
              {
                "name": "Original Pieces",
                "type": "quantity",
                "is_required": true,
                "min_selections": 0,
                "max_selections": null,
                "linked_total": 15,
                "linked_to_index": 1,
                "unit_label": "pieces",
                "sort_order": 1,
                "values": [
                  {
                    "name": "Original",
                    "price_delta": 0,
                    "sort_order": 1
                  }
                ]
              },
              {
                "name": "Spicy Pieces",
                "type": "quantity",
                "is_required": true,
                "min_selections": 0,
                "max_selections": null,
                "linked_total": 15,
                "linked_to_index": 0,
                "unit_label": "pieces",
                "sort_order": 2,
                "values": [
                  {
                    "name": "Spicy",
                    "price_delta": 0,
                    "sort_order": 1
                  }
                ]
              }
            ]
          },
          {
            "product": "Big Family Meal",
            "groups": [
              {
                "name": "Original Pieces",
                "type": "quantity",
                "is_required": true,
                "min_selections": 0,
                "max_selections": null,
                "linked_total": 18,
                "linked_to_index": 1,
                "unit_label": "pieces",
                "sort_order": 1,
                "values": [
                  {
                    "name": "Original",
                    "price_delta": 0,
                    "sort_order": 1
                  }
                ]
              },
              {
                "name": "Spicy Pieces",
                "type": "quantity",
                "is_required": true,
                "min_selections": 0,
                "max_selections": null,
                "linked_total": 18,
                "linked_to_index": 0,
                "unit_label": "pieces",
                "sort_order": 2,
                "values": [
                  {
                    "name": "Spicy",
                    "price_delta": 0,
                    "sort_order": 1
                  }
                ]
              }
            ]
          },
          {
            "product": "Super Doodz",
            "groups": [
              {
                "name": "Original Pieces",
                "type": "quantity",
                "is_required": true,
                "min_selections": 0,
                "max_selections": null,
                "linked_total": 4,
                "linked_to_index": 1,
                "unit_label": "pieces",
                "sort_order": 1,
                "values": [
                  {
                    "name": "Original",
                    "price_delta": 0,
                    "sort_order": 1
                  }
                ]
              },
              {
                "name": "Spicy Pieces",
                "type": "quantity",
                "is_required": true,
                "min_selections": 0,
                "max_selections": null,
                "linked_total": 4,
                "linked_to_index": 0,
                "unit_label": "pieces",
                "sort_order": 2,
                "values": [
                  {
                    "name": "Spicy",
                    "price_delta": 0,
                    "sort_order": 1
                  }
                ]
              },
              {
                "name": "Choice Of Meat",
                "type": "checkbox",
                "is_required": false,
                "min_selections": 0,
                "max_selections": 1,
                "sort_order": 3,
                "values": [
                  {
                    "name": "White Meat",
                    "description": "White meat portion",
                    "price_delta": 20,
                    "sort_order": 1
                  },
                  {
                    "name": "Dark Meat",
                    "price_delta": 0,
                    "sort_order": 2,
                    "is_default": true
                  }
                ]
              }
            ]
          },
          {
            "product": "Nashville Tenders",
            "groups": [
              {
                "name": "Original Tenders",
                "type": "quantity",
                "is_required": true,
                "min_selections": 0,
                "max_selections": null,
                "linked_total": 3,
                "linked_to_index": 1,
                "unit_label": "tenders",
                "sort_order": 1,
                "values": [
                  {
                    "name": "Original",
                    "price_delta": 0,
                    "sort_order": 1
                  }
                ]
              },
              {
                "name": "Spicy Tenders",
                "type": "quantity",
                "is_required": true,
                "min_selections": 0,
                "max_selections": null,
                "linked_total": 3,
                "linked_to_index": 0,
                "unit_label": "tenders",
                "sort_order": 2,
                "values": [
                  {
                    "name": "Spicy",
                    "price_delta": 0,
                    "sort_order": 1
                  }
                ]
              }
            ]
          },
          {
            "product": "Super Nashville Tender",
            "groups": [
              {
                "name": "Original Tenders",
                "type": "quantity",
                "is_required": true,
                "min_selections": 0,
                "max_selections": null,
                "linked_total": 5,
                "linked_to_index": 1,
                "unit_label": "tenders",
                "sort_order": 1,
                "values": [
                  {
                    "name": "Original",
                    "price_delta": 0,
                    "sort_order": 1
                  }
                ]
              },
              {
                "name": "Spicy Tenders",
                "type": "quantity",
                "is_required": true,
                "min_selections": 0,
                "max_selections": null,
                "linked_total": 5,
                "linked_to_index": 0,
                "unit_label": "tenders",
                "sort_order": 2,
                "values": [
                  {
                    "name": "Spicy",
                    "price_delta": 0,
                    "sort_order": 1
                  }
                ]
              }
            ]
          },
          {
            "product": "Tender Box",
            "groups": [
              {
                "name": "Original Tenders",
                "type": "quantity",
                "is_required": true,
                "min_selections": 0,
                "max_selections": null,
                "linked_total": 3,
                "linked_to_index": 1,
                "unit_label": "tenders",
                "sort_order": 1,
                "values": [
                  {
                    "name": "Original",
                    "price_delta": 0,
                    "sort_order": 1
                  }
                ]
              },
              {
                "name": "Spicy Tenders",
                "type": "quantity",
                "is_required": true,
                "min_selections": 0,
                "max_selections": null,
                "linked_total": 3,
                "linked_to_index": 0,
                "unit_label": "tenders",
                "sort_order": 2,
                "values": [
                  {
                    "name": "Spicy",
                    "price_delta": 0,
                    "sort_order": 1
                  }
                ]
              }
            ]
          },
          {
            "product": "Super Tender Box",
            "groups": [
              {
                "name": "Original Tenders",
                "type": "quantity",
                "is_required": true,
                "min_selections": 0,
                "max_selections": null,
                "linked_total": 5,
                "linked_to_index": 1,
                "unit_label": "tenders",
                "sort_order": 1,
                "values": [
                  {
                    "name": "Original",
                    "price_delta": 0,
                    "sort_order": 1
                  }
                ]
              },
              {
                "name": "Spicy Tenders",
                "type": "quantity",
                "is_required": true,
                "min_selections": 0,
                "max_selections": null,
                "linked_total": 5,
                "linked_to_index": 0,
                "unit_label": "tenders",
                "sort_order": 2,
                "values": [
                  {
                    "name": "Spicy",
                    "price_delta": 0,
                    "sort_order": 1
                  }
                ]
              }
            ]
          },
          {
            "product": "Tender Meal",
            "groups": [
              {
                "name": "Original Tenders",
                "type": "quantity",
                "is_required": true,
                "min_selections": 0,
                "max_selections": null,
                "linked_total": 10,
                "linked_to_index": 1,
                "unit_label": "tenders",
                "sort_order": 1,
                "values": [
                  {
                    "name": "Original",
                    "price_delta": 0,
                    "sort_order": 1
                  }
                ]
              },
              {
                "name": "Spicy Tenders",
                "type": "quantity",
                "is_required": true,
                "min_selections": 0,
                "max_selections": null,
                "linked_total": 10,
                "linked_to_index": 0,
                "unit_label": "tenders",
                "sort_order": 2,
                "values": [
                  {
                    "name": "Spicy",
                    "price_delta": 0,
                    "sort_order": 1
                  }
                ]
              }
            ]
          },
          {
            "product": "Mix Box",
            "groups": [
              {
                "name": "Original Pieces",
                "type": "quantity",
                "is_required": true,
                "min_selections": 0,
                "max_selections": null,
                "linked_total": 2,
                "linked_to_index": 1,
                "unit_label": "pieces",
                "sort_order": 1,
                "values": [
                  {
                    "name": "Original",
                    "price_delta": 0,
                    "sort_order": 1
                  }
                ]
              },
              {
                "name": "Spicy Pieces",
                "type": "quantity",
                "is_required": true,
                "min_selections": 0,
                "max_selections": null,
                "linked_total": 2,
                "linked_to_index": 0,
                "unit_label": "pieces",
                "sort_order": 2,
                "values": [
                  {
                    "name": "Spicy",
                    "price_delta": 0,
                    "sort_order": 1
                  }
                ]
              },
              {
                "name": "Original Tenders",
                "type": "quantity",
                "is_required": true,
                "min_selections": 0,
                "max_selections": null,
                "linked_total": 2,
                "linked_to_index": 3,
                "unit_label": "tenders",
                "sort_order": 3,
                "values": [
                  {
                    "name": "Original",
                    "price_delta": 0,
                    "sort_order": 1
                  }
                ]
              },
              {
                "name": "Spicy Tenders",
                "type": "quantity",
                "is_required": true,
                "min_selections": 0,
                "max_selections": null,
                "linked_total": 2,
                "linked_to_index": 2,
                "unit_label": "tenders",
                "sort_order": 4,
                "values": [
                  {
                    "name": "Spicy",
                    "price_delta": 0,
                    "sort_order": 1
                  }
                ]
              },
              {
                "name": "Choice Of Meat",
                "type": "checkbox",
                "is_required": false,
                "min_selections": 0,
                "max_selections": 1,
                "sort_order": 5,
                "values": [
                  {
                    "name": "White Meat",
                    "description": "White meat portion",
                    "price_delta": 20,
                    "sort_order": 1
                  },
                  {
                    "name": "Dark Meat",
                    "price_delta": 0,
                    "sort_order": 2,
                    "is_default": true
                  }
                ]
              }
            ]
          },
          {
            "product": "Family Mix Meal",
            "groups": [
              {
                "name": "Original Pieces",
                "type": "quantity",
                "is_required": true,
                "min_selections": 0,
                "max_selections": null,
                "linked_total": 6,
                "linked_to_index": 1,
                "unit_label": "pieces",
                "sort_order": 1,
                "values": [
                  {
                    "name": "Original",
                    "price_delta": 0,
                    "sort_order": 1
                  }
                ]
              },
              {
                "name": "Spicy Pieces",
                "type": "quantity",
                "is_required": true,
                "min_selections": 0,
                "max_selections": null,
                "linked_total": 6,
                "linked_to_index": 0,
                "unit_label": "pieces",
                "sort_order": 2,
                "values": [
                  {
                    "name": "Spicy",
                    "price_delta": 0,
                    "sort_order": 1
                  }
                ]
              },
              {
                "name": "Original Tenders",
                "type": "quantity",
                "is_required": true,
                "min_selections": 0,
                "max_selections": null,
                "linked_total": 6,
                "linked_to_index": 3,
                "unit_label": "tenders",
                "sort_order": 3,
                "values": [
                  {
                    "name": "Original",
                    "price_delta": 0,
                    "sort_order": 1
                  }
                ]
              },
              {
                "name": "Spicy Tenders",
                "type": "quantity",
                "is_required": true,
                "min_selections": 0,
                "max_selections": null,
                "linked_total": 6,
                "linked_to_index": 2,
                "unit_label": "tenders",
                "sort_order": 4,
                "values": [
                  {
                    "name": "Spicy",
                    "price_delta": 0,
                    "sort_order": 1
                  }
                ]
              }
            ]
          },
          {
            "product": "Build Your Own Burger",
            "groups": [
              {
                "name": "Main",
                "type": "radio",
                "is_required": true,
                "min_selections": 1,
                "max_selections": 1,
                "sort_order": 1,
                "values": [
                  {
                    "name": "Beef Patty",
                    "description": "Smashed 100% beef",
                    "price_delta": 60,
                    "sort_order": 1,
                    "modifier": "Beef Patty"
                  },
                  {
                    "name": "Crispy Chicken Fillet",
                    "price_delta": 50,
                    "sort_order": 2,
                    "modifier": "Crispy Fillet"
                  },
                  {
                    "name": "Nashville Tender",
                    "price_delta": 65,
                    "sort_order": 3,
                    "modifier": "Nashville Tender"
                  }
                ]
              },
              {
                "name": "Bun",
                "type": "radio",
                "is_required": true,
                "min_selections": 1,
                "max_selections": 1,
                "sort_order": 2,
                "values": [
                  {
                    "name": "Toasted Brioche Bun",
                    "description": "Toasted soft brioche",
                    "price_delta": 12,
                    "is_default": true,
                    "sort_order": 1,
                    "modifier": "Toasted Brioche Bun"
                  },
                  {
                    "name": "Whole Wheat Bun",
                    "price_delta": 12,
                    "sort_order": 2,
                    "modifier": "Whole Wheat Bun"
                  },
                  {
                    "name": "Potato Bun",
                    "price_delta": 12,
                    "sort_order": 3,
                    "modifier": "Potato Bun"
                  }
                ]
              },
              {
                "name": "Cheese",
                "type": "checkbox",
                "is_required": false,
                "min_selections": 0,
                "max_selections": 2,
                "sort_order": 3,
                "values": [
                  {
                    "name": "American Cheese",
                    "description": "Melted American",
                    "price_delta": 15,
                    "is_default": true,
                    "sort_order": 1,
                    "modifier": "Extra American Cheese"
                  },
                  {
                    "name": "Cheddar",
                    "price_delta": 15,
                    "sort_order": 2,
                    "modifier": "Extra Cheddar"
                  },
                  {
                    "name": "Mozzarella",
                    "price_delta": 20,
                    "sort_order": 3,
                    "modifier": "Extra Mozzarella"
                  }
                ]
              },
              {
                "name": "Toppings",
                "type": "checkbox",
                "is_required": false,
                "min_selections": 0,
                "max_selections": 5,
                "sort_order": 4,
                "values": [
                  {
                    "name": "Crisp Lettuce",
                    "description": "Fresh crisp lettuce",
                    "price_delta": 8,
                    "is_default": true,
                    "sort_order": 1,
                    "modifier": "Crisp Lettuce"
                  },
                  {
                    "name": "Pickled Cucumbers",
                    "price_delta": 8,
                    "is_default": true,
                    "sort_order": 2,
                    "modifier": "Pickled Cucumbers"
                  },
                  {
                    "name": "Grilled Mushrooms",
                    "price_delta": 20,
                    "sort_order": 3,
                    "modifier": "Grilled Mushrooms"
                  },
                  {
                    "name": "Jalapenos",
                    "price_delta": 10,
                    "sort_order": 4,
                    "modifier": "Jalapenos"
                  },
                  {
                    "name": "Smoked Turkey",
                    "price_delta": 25,
                    "sort_order": 5,
                    "modifier": "Smoked Turkey"
                  },
                  {
                    "name": "Fried Onion Rings",
                    "price_delta": 25,
                    "sort_order": 6,
                    "modifier": "Fried Onion Rings"
                  }
                ]
              },
              {
                "name": "Sauce",
                "type": "radio",
                "is_required": true,
                "min_selections": 1,
                "max_selections": 1,
                "sort_order": 5,
                "values": [
                  {
                    "name": "Comeback Sauce",
                    "description": "Our signature comeback sauce",
                    "price_delta": 20,
                    "is_default": true,
                    "sort_order": 1,
                    "modifier": "Comeback Sauce Cup"
                  },
                  {
                    "name": "Smoky Sauce",
                    "price_delta": 20,
                    "sort_order": 2,
                    "modifier": "Smoky Sauce Cup"
                  },
                  {
                    "name": "Ranch",
                    "price_delta": 20,
                    "sort_order": 3,
                    "modifier": "Ranch Cup"
                  },
                  {
                    "name": "Buffalo Sauce",
                    "price_delta": 20,
                    "sort_order": 4,
                    "modifier": "Buffalo Sauce Cup"
                  },
                  {
                    "name": "Tiger Sauce",
                    "price_delta": 20,
                    "sort_order": 5,
                    "modifier": "Tiger Sauce Cup"
                  },
                  {
                    "name": "Doods Sauce",
                    "price_delta": 20,
                    "sort_order": 6,
                    "modifier": "Doods Sauce Cup"
                  },
                  {
                    "name": "Barbecue Sauce",
                    "price_delta": 18,
                    "sort_order": 7,
                    "modifier": "Barbecue Sauce Cup"
                  },
                  {
                    "name": "Hot Honey",
                    "price_delta": 22,
                    "sort_order": 8,
                    "modifier": "Hot Honey Cup"
                  },
                  {
                    "name": "Sriracha Mayo",
                    "price_delta": 22,
                    "sort_order": 9,
                    "modifier": "Sriracha Mayo Cup"
                  }
                ]
              },
              {
                "name": "Extras",
                "type": "checkbox",
                "is_required": false,
                "min_selections": 0,
                "max_selections": 4,
                "sort_order": 6,
                "values": [
                  {
                    "name": "Extra Crispy Tender",
                    "price_delta": 85,
                    "sort_order": 1,
                    "modifier": "Extra Crispy Tender"
                  },
                  {
                    "name": "Extra Nashville Tender",
                    "price_delta": 95,
                    "sort_order": 2,
                    "modifier": "Extra Nashville Tender"
                  },
                  {
                    "name": "Extra Cheese",
                    "description": "One more cheese slice",
                    "price_delta": 15,
                    "sort_order": 3,
                    "modifier": "Extra American Cheese"
                  },
                  {
                    "name": "Coleslaw",
                    "price_delta": 20,
                    "sort_order": 4,
                    "modifier": "Coleslaw"
                  }
                ]
              }
            ]
          }
        ]
        $json$::jsonb)
    LOOP
        SELECT id INTO v_product_id
        FROM products
        WHERE name = v_def->>'product' AND is_deleted = false AND is_modifier = false
        ORDER BY id
        LIMIT 1;

        IF v_product_id IS NULL THEN
            CONTINUE;
        END IF;

        -- Idempotency: never touch a tree an admin has already customised.
        IF EXISTS (SELECT 1 FROM product_options WHERE product_id = v_product_id) THEN
            UPDATE products SET is_customizable = true WHERE id = v_product_id AND is_customizable = false;
            CONTINUE;
        END IF;

        UPDATE products SET is_customizable = true, updated_at = CURRENT_TIMESTAMP WHERE id = v_product_id;

        v_option_ids := '{}';

        FOR v_group IN SELECT * FROM jsonb_array_elements(v_def->'groups') LOOP
            INSERT INTO product_options (product_id, name, type, is_required, min_selections, max_selections, sort_order, is_available, linked_total, unit_label)
            VALUES (
                v_product_id,
                v_group->>'name',
                v_group->>'type',
                COALESCE((v_group->>'is_required')::boolean, false),
                COALESCE((v_group->>'min_selections')::int, 0),
                (v_group->>'max_selections')::int,
                COALESCE((v_group->>'sort_order')::int, 0),
                true,
                (v_group->>'linked_total')::int,
                v_group->>'unit_label'
            )
            RETURNING id INTO v_option_id;

            v_option_ids := array_append(v_option_ids, v_option_id);

            FOR v_value IN SELECT * FROM jsonb_array_elements(v_group->'values') LOOP
                INSERT INTO option_values (option_id, name, description, price_delta, is_default, is_available, sort_order, modifier_product_id)
                VALUES (
                    v_option_id,
                    v_value->>'name',
                    v_value->>'description',
                    COALESCE((v_value->>'price_delta')::numeric, 0),
                    COALESCE((v_value->>'is_default')::boolean, false),
                    true,
                    COALESCE((v_value->>'sort_order')::int, 0),
                    (SELECT p.id FROM products p WHERE p.is_modifier = true AND p.name = v_value->>'modifier')
                );
            END LOOP;
        END LOOP;

        -- Second pass: a counted pair points at each other, and neither half has an
        -- id to point at until both rows exist, so the links are wired afterwards.
        FOR v_link IN
            SELECT value AS g, ordinality AS pos
            FROM jsonb_array_elements(v_def->'groups') WITH ORDINALITY
        LOOP
            IF (v_link.g->>'type') = 'quantity' AND (v_link.g->>'linked_to_index')::int IS NOT NULL THEN
                UPDATE product_options
                SET linked_group_id = v_option_ids[(v_link.g->>'linked_to_index')::int + 1]
                WHERE id = v_option_ids[v_link.pos];
            END IF;
        END LOOP;
    END LOOP;
END $seed$;

-- 4. Reconcile the flag. is_customizable is a denormalised mirror of "has an option
--    tree", so it is derived here instead of being tracked by hand. This repairs any
--    drift left behind by earlier admin edits or interrupted runs.
UPDATE products p
SET is_customizable = (EXISTS (SELECT 1 FROM product_options po WHERE po.product_id = p.id)),
    updated_at = CURRENT_TIMESTAMP
WHERE p.is_modifier = false
  AND p.is_deleted = false
  AND p.is_customizable <> (EXISTS (SELECT 1 FROM product_options po WHERE po.product_id = p.id));

-- Branches (mirrors client/src/features/store-locations/data.ts)
INSERT INTO branches (id, name, area, address, phone, opening_time, closing_time, lat, lng) VALUES
(1, 'DODZ El Tagamoa', 'New Cairo', 'The Place Mall, Dr. Ahmed Okasha St., El Banafseg services, First Settlement, New Cairo', '16974', '10:00', '03:30', 30.04386, 31.467604),
(2, 'DODZ Nasr City', 'Nasr City', 'End of Mostafa El-Nahhas St., next to Carrefour, Mahdy Arafa, Nasr City', '16974', '10:00', '03:30', 30.054776, 31.348243),
(3, 'DODZ Ain Shams', 'Ain Shams', '36 Ain Shams Main St., Al-Naam Square, in front of Haty Ahmed Neda', '16974', '10:00', '03:30', 30.12429, 31.318853),
(4, 'DODZ Almaza', 'Heliopolis', '72 El-Horreya St., Almaza, Heliopolis, next to Yokal Restaurant', '16974', '10:00', '03:30', 30.088608, 31.34773),
(5, 'DODZ Hadayek El Kobba', 'Hadayek El Kobba', 'Saraya Mall, Wali Al Ahd St., Al Qobba Gardens, next to McDonald''s', '16974', '10:00', '03:30', 30.087563, 31.283938)
ON CONFLICT (id) DO NOTHING;

-- Sample orders + items (only when no orders exist so re-running the seed stays idempotent)
DO $$
DECLARE
    v_oid INTEGER;
BEGIN
    IF (SELECT count(*) FROM orders) > 0 THEN
        RETURN;
    END IF;

    -- Branch 1 - DODZ El Tagamoa
    INSERT INTO orders (branch_id, customer_name, customer_phone, status, total, created_at)
    VALUES (1, 'Omar Khaled', '01012345671', 'Completed', 0, CURRENT_TIMESTAMP - INTERVAL '1 hour') RETURNING id INTO v_oid;
    INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal) VALUES
        (v_oid, (SELECT id FROM products WHERE name='Festival Box' LIMIT 1), 'Festival Box', 966.7, 1, 966.7);

    INSERT INTO orders (branch_id, customer_name, customer_phone, status, total, created_at)
    VALUES (1, 'Farah Ali', '01012345672', 'Completed', 0, CURRENT_TIMESTAMP - INTERVAL '4 hours') RETURNING id INTO v_oid;
    INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal) VALUES
        (v_oid, (SELECT id FROM products WHERE name='Buffalo Ranch Chicken Wings' LIMIT 1), 'Buffalo Ranch Chicken Wings', 85, 1, 85),
        (v_oid, (SELECT id FROM products WHERE name='Fi Cola' LIMIT 1), 'Fi Cola', 35, 1, 35);

    INSERT INTO orders (branch_id, customer_name, customer_phone, status, total, created_at)
    VALUES (1, 'Karim Hassan', '01012345673', 'Completed', 0, CURRENT_TIMESTAMP - INTERVAL '1 day' - INTERVAL '1 hour') RETURNING id INTO v_oid;
    INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal) VALUES
        (v_oid, (SELECT id FROM products WHERE name='Secret De Sandwich' LIMIT 1), 'Secret De Sandwich', 125, 1, 125),
        (v_oid, (SELECT id FROM products WHERE name='Curly Fries' LIMIT 1), 'Curly Fries', 105, 1, 105);

    INSERT INTO orders (branch_id, customer_name, customer_phone, status, total, created_at)
    VALUES (1, 'Dina Sherif', '01012345674', 'On the way', 0, CURRENT_TIMESTAMP - INTERVAL '2 days' - INTERVAL '3 hours') RETURNING id INTO v_oid;
    INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal) VALUES
        (v_oid, (SELECT id FROM products WHERE name='Twister Doods' LIMIT 1), 'Twister Doods', 145, 1, 145),
        (v_oid, (SELECT id FROM products WHERE name='Doods' LIMIT 1), 'Doods', 40, 1, 40);

    INSERT INTO orders (branch_id, customer_name, customer_phone, status, total, created_at)
    VALUES (1, 'Mohamed Tarek', '01012345675', 'Cancelled', 0, CURRENT_TIMESTAMP - INTERVAL '5 days' - INTERVAL '1 hour') RETURNING id INTO v_oid;
    INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal) VALUES
        (v_oid, (SELECT id FROM products WHERE name='Hot Honey Sandwich' LIMIT 1), 'Hot Honey Sandwich', 140, 1, 140),
        (v_oid, (SELECT id FROM products WHERE name='Cheesy Fries' LIMIT 1), 'Cheesy Fries', 105, 1, 105);

    INSERT INTO orders (branch_id, customer_name, customer_phone, status, total, created_at)
    VALUES (1, 'Mariam Nabil', '01012345676', 'Completed', 0, CURRENT_TIMESTAMP - INTERVAL '6 days' - INTERVAL '4 hours') RETURNING id INTO v_oid;
    INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal) VALUES
        (v_oid, (SELECT id FROM products WHERE name='Double Dip' LIMIT 1), 'Double Dip', 652.8, 1, 652.8);

    -- Branch 2 - DODZ Nasr City
    INSERT INTO orders (branch_id, customer_name, customer_phone, status, total, created_at)
    VALUES (2, 'Youssef Adel', '01098765432', 'Preparing', 0, CURRENT_TIMESTAMP - INTERVAL '3 hours') RETURNING id INTO v_oid;
    INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal) VALUES
        (v_oid, (SELECT id FROM products WHERE name='Mega Star Family Meal' LIMIT 1), 'Mega Star Family Meal', 1035, 1, 1035);

    INSERT INTO orders (branch_id, customer_name, customer_phone, status, total, created_at)
    VALUES (2, 'Mariam Nabil', '01098765433', 'Completed', 0, CURRENT_TIMESTAMP - INTERVAL '4 hours') RETURNING id INTO v_oid;
    INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal) VALUES
        (v_oid, (SELECT id FROM products WHERE name='Doodz Snack' LIMIT 1), 'Doodz Snack', 160, 1, 160),
        (v_oid, (SELECT id FROM products WHERE name='Fries' LIMIT 1), 'Fries', 65, 1, 65);

    INSERT INTO orders (branch_id, customer_name, customer_phone, status, total, created_at)
    VALUES (2, 'Seif Adel', '01098765434', 'Completed', 0, CURRENT_TIMESTAMP - INTERVAL '2 days' - INTERVAL '1 hour') RETURNING id INTO v_oid;
    INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal) VALUES
        (v_oid, (SELECT id FROM products WHERE name='Star Meal' LIMIT 1), 'Star Meal', 905, 1, 905);

    INSERT INTO orders (branch_id, customer_name, customer_phone, status, total, created_at)
    VALUES (2, 'Omar Youssef', '01098765435', 'Completed', 0, CURRENT_TIMESTAMP - INTERVAL '2 days' - INTERVAL '2 hours') RETURNING id INTO v_oid;
    INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal) VALUES
        (v_oid, (SELECT id FROM products WHERE name='Super Crunchy' LIMIT 1), 'Super Crunchy', 230, 1, 230),
        (v_oid, (SELECT id FROM products WHERE name='Fries' LIMIT 1), 'Fries', 65, 1, 65);

    INSERT INTO orders (branch_id, customer_name, customer_phone, status, total, created_at)
    VALUES (2, 'Ahmed Samir', '01098765436', 'Completed', 0, CURRENT_TIMESTAMP - INTERVAL '5 days' - INTERVAL '3 hours') RETURNING id INTO v_oid;
    INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal) VALUES
        (v_oid, (SELECT id FROM products WHERE name='Nashville Loaded Fries' LIMIT 1), 'Nashville Loaded Fries', 145, 1, 145),
        (v_oid, (SELECT id FROM products WHERE name='Fi Cola' LIMIT 1), 'Fi Cola', 35, 1, 35);

    INSERT INTO orders (branch_id, customer_name, customer_phone, status, total, created_at)
    VALUES (2, 'Nour El Din', '01098765437', 'Completed', 0, CURRENT_TIMESTAMP - INTERVAL '3 days' - INTERVAL '3 hours') RETURNING id INTO v_oid;
    INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal) VALUES
        (v_oid, (SELECT id FROM products WHERE name='Super Tender Box' LIMIT 1), 'Super Tender Box', 275, 1, 275);

    -- Branch 3 - DODZ Ain Shams
    INSERT INTO orders (branch_id, customer_name, customer_phone, status, total, created_at)
    VALUES (3, 'Ahmed Samir', '01055512345', 'Cancelled', 0, CURRENT_TIMESTAMP - INTERVAL '5 hours') RETURNING id INTO v_oid;
    INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal) VALUES
        (v_oid, (SELECT id FROM products WHERE name='Double Dip' LIMIT 1), 'Double Dip', 652.8, 1, 652.8);

    INSERT INTO orders (branch_id, customer_name, customer_phone, status, total, created_at)
    VALUES (3, 'Nour El Din', '01055512346', 'Completed', 0, CURRENT_TIMESTAMP - INTERVAL '6 hours') RETURNING id INTO v_oid;
    INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal) VALUES
        (v_oid, (SELECT id FROM products WHERE name='Nashy' LIMIT 1), 'Nashy', 694.8, 1, 694.8);

    INSERT INTO orders (branch_id, customer_name, customer_phone, status, total, created_at)
    VALUES (3, 'Salma Fathy', '01055512347', 'Completed', 0, CURRENT_TIMESTAMP - INTERVAL '3 days' - INTERVAL '1 hour') RETURNING id INTO v_oid;
    INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal) VALUES
        (v_oid, (SELECT id FROM products WHERE name='Family Meal' LIMIT 1), 'Family Meal', 690, 1, 690),
        (v_oid, (SELECT id FROM products WHERE name='1 Liter Maxi Drink' LIMIT 1), '1 Liter Maxi Drink', 50, 1, 50);

    INSERT INTO orders (branch_id, customer_name, customer_phone, status, total, created_at)
    VALUES (3, 'Hala Mostafa', '01055512348', 'Completed', 0, CURRENT_TIMESTAMP - INTERVAL '4 days' - INTERVAL '2 hours') RETURNING id INTO v_oid;
    INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal) VALUES
        (v_oid, (SELECT id FROM products WHERE name='Nashy' LIMIT 1), 'Nashy', 694.8, 1, 694.8);

    INSERT INTO orders (branch_id, customer_name, customer_phone, status, total, created_at)
    VALUES (3, 'Seif Adel', '01055512349', 'On the way', 0, CURRENT_TIMESTAMP - INTERVAL '2 days' - INTERVAL '5 hours') RETURNING id INTO v_oid;
    INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal) VALUES
        (v_oid, (SELECT id FROM products WHERE name='Smoked Chicken Wings' LIMIT 1), 'Smoked Chicken Wings', 115, 1, 115),
        (v_oid, (SELECT id FROM products WHERE name='Fries' LIMIT 1), 'Fries', 65, 1, 65);

    -- Branch 4 - DODZ Almaza
    INSERT INTO orders (branch_id, customer_name, customer_phone, status, total, created_at)
    VALUES (4, 'Hana Ibrahim', '01044456789', 'Preparing', 0, CURRENT_TIMESTAMP - INTERVAL '7 hours') RETURNING id INTO v_oid;
    INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal) VALUES
        (v_oid, (SELECT id FROM products WHERE name='Family Mix Meal' LIMIT 1), 'Family Mix Meal', 805, 1, 805);

    INSERT INTO orders (branch_id, customer_name, customer_phone, status, total, created_at)
    VALUES (4, 'Karim Hassan', '01044456780', 'Completed', 0, CURRENT_TIMESTAMP - INTERVAL '1 day' - INTERVAL '2 hours') RETURNING id INTO v_oid;
    INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal) VALUES
        (v_oid, (SELECT id FROM products WHERE name='Truffle D Sandwich' LIMIT 1), 'Truffle D Sandwich', 175, 1, 175),
        (v_oid, (SELECT id FROM products WHERE name='Curly Cheesy Fries' LIMIT 1), 'Curly Cheesy Fries', 145, 1, 145);

    INSERT INTO orders (branch_id, customer_name, customer_phone, status, total, created_at)
    VALUES (4, 'Omar Khaled', '01044456781', 'Completed', 0, CURRENT_TIMESTAMP - INTERVAL '5 days' - INTERVAL '2 hours') RETURNING id INTO v_oid;
    INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal) VALUES
        (v_oid, (SELECT id FROM products WHERE name='Big Family Meal' LIMIT 1), 'Big Family Meal', 1170, 1, 1170);

    INSERT INTO orders (branch_id, customer_name, customer_phone, status, total, created_at)
    VALUES (4, 'Sara Mostafa', '01044456782', 'On the way', 0, CURRENT_TIMESTAMP - INTERVAL '6 days' - INTERVAL '1 hour') RETURNING id INTO v_oid;
    INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal) VALUES
        (v_oid, (SELECT id FROM products WHERE name='Mighty D Sandwich' LIMIT 1), 'Mighty D Sandwich', 140, 1, 140),
        (v_oid, (SELECT id FROM products WHERE name='Cheesy Fries' LIMIT 1), 'Cheesy Fries', 105, 1, 105);

    INSERT INTO orders (branch_id, customer_name, customer_phone, status, total, created_at)
    VALUES (4, 'Nour Amin', '01044456783', 'Completed', 0, CURRENT_TIMESTAMP - INTERVAL '3 days' - INTERVAL '4 hours') RETURNING id INTO v_oid;
    INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal) VALUES
        (v_oid, (SELECT id FROM products WHERE name='Sriracha Mayo Chicken Wings' LIMIT 1), 'Sriracha Mayo Chicken Wings', 115, 1, 115),
        (v_oid, (SELECT id FROM products WHERE name='Ranch' LIMIT 1), 'Ranch', 40, 1, 40);

    -- Branch 5 - DODZ Hadayek El Kobba
    INSERT INTO orders (branch_id, customer_name, customer_phone, status, total, created_at)
    VALUES (5, 'Laila Mohamed', '01011122334', 'On the way', 0, CURRENT_TIMESTAMP - INTERVAL '1 day' - INTERVAL '2 hours') RETURNING id INTO v_oid;
    INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal) VALUES
        (v_oid, (SELECT id FROM products WHERE name='Tender Meal' LIMIT 1), 'Tender Meal', 610, 1, 610);

    INSERT INTO orders (branch_id, customer_name, customer_phone, status, total, created_at)
    VALUES (5, 'Mohamed Tarek', '01011122335', 'Cancelled', 0, CURRENT_TIMESTAMP - INTERVAL '1 day' - INTERVAL '3 hours') RETURNING id INTO v_oid;
    INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal) VALUES
        (v_oid, (SELECT id FROM products WHERE name='Cheesy Fries' LIMIT 1), 'Cheesy Fries', 105, 1, 105),
        (v_oid, (SELECT id FROM products WHERE name='T Ranch Sandwich' LIMIT 1), 'T Ranch Sandwich', 130, 1, 130);

    INSERT INTO orders (branch_id, customer_name, customer_phone, status, total, created_at)
    VALUES (5, 'Nour Amin', '01011122336', 'Preparing', 0, CURRENT_TIMESTAMP - INTERVAL '4 days' - INTERVAL '1 hour') RETURNING id INTO v_oid;
    INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal) VALUES
        (v_oid, (SELECT id FROM products WHERE name='Mix Box' LIMIT 1), 'Mix Box', 265, 1, 265);

    INSERT INTO orders (branch_id, customer_name, customer_phone, status, total, created_at)
    VALUES (5, 'Youssef Adel', '01011122337', 'Completed', 0, CURRENT_TIMESTAMP - INTERVAL '6 days' - INTERVAL '2 hours') RETURNING id INTO v_oid;
    INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal) VALUES
        (v_oid, (SELECT id FROM products WHERE name='Sriracha Mayo Chicken Wings' LIMIT 1), 'Sriracha Mayo Chicken Wings', 115, 1, 115),
        (v_oid, (SELECT id FROM products WHERE name='Ranch' LIMIT 1), 'Ranch', 40, 1, 40);

    -- Recompute order totals so they exactly match the sum of their items
    UPDATE orders o SET total = COALESCE((SELECT SUM(subtotal) FROM order_items WHERE order_id = o.id), 0), updated_at = CURRENT_TIMESTAMP;
END $$;

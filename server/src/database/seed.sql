-- Seed data generated from client/src/features/menu/data.ts

INSERT INTO categories (id, name, cover_image, icon_image) VALUES
(20150884, 'Bundles', 'https://talabat.dhmedia.io/image/talabat/MenuItems/WhatsApp_Image_20260111_a639038074343767288.jpeg?width=400', 'https://talabat.dhmedia.io/image/talabat/MenuItems/WhatsApp_Image_20260111_a639038074343767288.jpeg?width=400'),
(19653587, 'Single Meals', 'https://talabat.dhmedia.io/image/talabat/MenuItems/mmw_638938145051185287?width=400', 'https://talabat.dhmedia.io/image/talabat/MenuItems/mmw_638938145051185287?width=400'),
(19653585, 'Family Meals', 'https://talabat.dhmedia.io/image/talabat/MenuItems/mmw_638938148358404917?width=400', 'https://talabat.dhmedia.io/image/talabat/MenuItems/mmw_638938148358404917?width=400'),
(19653589, 'Kids Meals', 'https://talabat.dhmedia.io/image/talabat/MenuItems/mmw_638946579749596278?width=400', 'https://talabat.dhmedia.io/image/talabat/MenuItems/mmw_638946579749596278?width=400'),
(19653594, 'Sandwiches', 'https://talabat.dhmedia.io/image/talabat/MenuItems/WhatsApp_Image_20250918_a638938028900195085.jpeg?width=400', 'https://talabat.dhmedia.io/image/talabat/MenuItems/WhatsApp_Image_20250918_a638938028900195085.jpeg?width=400'),
(19653595, 'Burger', 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/f1a59e0a-3b1e-45e6-abc3-613941c895c0.jpg?width=400', 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/f1a59e0a-3b1e-45e6-abc3-613941c895c0.jpg?width=400'),
(19896634, 'Chicken Wings', 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771237/product/2579257726/8a2b0a4a-8585-419e-9222-14c1a8d4cbd1.jpg?width=400', 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771237/product/2579257726/8a2b0a4a-8585-419e-9222-14c1a8d4cbd1.jpg?width=400'),
(19653592, 'Appetizers', 'https://talabat.dhmedia.io/image/talabat/MenuItems/mmw_638944933890527259?width=400', 'https://talabat.dhmedia.io/image/talabat/MenuItems/mmw_638944933890527259?width=400'),
(19653588, 'Sauces', 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/b02e95a4-352e-4f94-85f3-f00a0021c538.jpg?width=400', 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/b02e95a4-352e-4f94-85f3-f00a0021c538.jpg?width=400'),
(19653591, 'Add Ons', 'https://talabat.dhmedia.io/image/talabat/MenuItems/mmw_638946582330610512?width=400', 'https://talabat.dhmedia.io/image/talabat/MenuItems/mmw_638946582330610512?width=400'),
(19653593, 'Drinks', 'https://talabat.dhmedia.io/image/talabat/MenuItems/WhatsApp_Image_20250918_a638938043011836257.jpeg?width=400', 'https://talabat.dhmedia.io/image/talabat/MenuItems/WhatsApp_Image_20250918_a638938043011836257.jpeg?width=400')
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (category_id, name, description, price, image, is_customizable) VALUES
(20150884, 'Solo Crave', 'Your choice of sandwich, a piece of chicken, fries, coleslaw, and a drink.', 317.6, 'https://talabat.dhmedia.io/image/talabat/MenuItems/WhatsApp_Image_20260111_a639038074343767288.jpeg?width=400', false),
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
(19896634, 'Sriracha Chicken Wings', '6 pieces of chicken wings with sriracha mayonnaise sauce.', 115, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771237/product/2579239395/976f843b-6b17-4ff1-b03a-5ae3a9c1d7f5.jpg?width=400', false),
(19896634, '4 Buffalo Ranch Chicken Wings', 'Crispy wings topped with buffalo and ranch sauce', 85, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771237/product/2579257726/8a2b0a4a-8585-419e-9222-14c1a8d4cbd1.jpg?width=400', false),
(19896634, '6 Buffalo Ranch Chicken Wings', 'Crispy wing pieces coated in buffalo and ranch sauce', 115, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771237/product/2579257727/6d615a49-30d4-41e3-8aa0-f8a70d96ea41.jpg?width=400', false),
(19896634, '6 Smoked Chicken Wings', 'Crispy wing pieces covered in smoky sauce', 115, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771286/product/267b69d1-1286-473f-822d-eb5ca95474a0.jpg?width=400', false),
(19896634, '4 Pcs Hot Honey Chicken Wings', 'Crispy chicken wing pieces coated in hot honey sauce', 85, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771286/product/9778ba83-c529-46d2-bf6f-a49bef6e6065.jpg?width=400', false),
(19896634, '6 Spicy Honey Chicken Wings', 'Crispy chicken wing pieces coated in hot honey sauce.', 115, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771237/product/2579263367/7b217b22-1ebd-46ac-9ee8-1e1094a83a99.jpg?width=400', false),
(19896634, '4 Sriracha Mayo Chicken Wings', 'Crispy chicken wing pieces coated with sriracha mayonnaise sauce.', 85, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771286/product/5a289971-f07e-462a-b98d-1f033a301ec7.jpg?width=400', false),
(19896634, '4 Smoked Chicken Wings', 'Crispy chicken wings pieces covered with smoky sauce', 85, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771286/product/0df8c4ce-2dd8-4a35-99c7-60196792b24e.jpg?width=400', false),
(19653592, 'Chicken Risotto Medium', 'Risotto with strips and sauce (Tiger or BBQ), hot or regular', 70, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771286/product/b94ad029-4eeb-458c-a3a3-91f9480a586d.jpg?width=400', false),
(19653592, 'Max Platter', 'Fried mozzarella cheese with two pieces of spicy cheddar cheese, fried onion rings, and curly fries.', 215, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/817ebfd7-740c-4ebf-8ee0-bb2459e64824.jpg?width=400', false),
(19653592, 'Curly Fries', 'Plate of curly fries.', 105, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/e71dd46c-5bc7-4a0f-8385-84b54affb6d0.jpg?width=400', false),
(19653592, 'Nashville Loaded Fries', 'Fries with Dodz sauce, Nashville tender, and pickles', 145, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771283/product/3f8152e5-0e57-431e-8244-f4c7a5f093ff.jpg?width=400', false),
(19653592, 'Cheesy Fries', 'Golden fried potatoes topped with cheddar cheese sauce.', 105, 'https://talabat.dhmedia.io/image/talabat/MenuItems/mmw_638944933890527259?width=400', false),
(19653592, 'Curly Cheesy Fries', 'Curly fries covered with cheddar sauce', 145, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771237/product/2200312744/6ae1bba4-f8a1-4e68-a092-b7f107d2f3d2.jpg?width=400', false),
(19653592, 'Chicken Rizo', 'Spiced rice with chicken pieces in barbecue or Tiger sauce.', 115, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771237/product/2200312747/3673cbaa-c037-40d6-8cd2-2eb92861ae8b.jpg?width=400', false),
(19653592, 'Mac and Cheese', 'Creamy pasta covered with cheddar sauce.', 75, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/2200312749/ad2a1f26-9661-4efe-a02f-583ba525cb58.jpg?width=400', false),
(19653592, 'Chicken Mac & Cheese', 'Creamy pasta topped with cheddar sauce, ranch, and crispy chicken strips.', 130, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771237/product/2200312750/71ce5d86-5563-43ab-bfbc-c360c1197a9b.jpg?width=400', false),
(19653588, 'Hot Honey', 'Small hot honey sauce cup', 40, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/b02e95a4-352e-4f94-85f3-f00a0021c538.jpg?width=400', false),
(19653588, 'Hot Honey', 'Medium hot honey sauce cup', 70, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/13b8ad81-08bd-442d-823f-b3b02bce67fc.jpg?width=400', false),
(19653588, 'Ranch', 'Small ranch sauce cup', 40, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/f8d88158-e51b-4c81-bf69-03c966f64b4a.jpg?width=400', false),
(19653588, 'Ranch', 'Medium ranch sauce cup', 65, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/40028c11-af88-46ab-8e48-3a4f53033d00.jpg?width=400', false),
(19653588, 'Sriracha Mayo', 'Small sriracha mayo sauce cup', 45, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/8c2bbc06-4a2e-4bf3-825a-2e3e2b5cf67a.jpg?width=400', false),
(19653588, 'Doods', 'Small cup of Doods sauce', 40, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/6b356ced-ea87-44d1-8de0-301c1481ee92.jpg?width=400', false),
(19653588, 'Sriracha Mayo', 'Medium sriracha mayo sauce cup', 65, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/adfb211b-d1c8-497a-b220-a5c22b0f96cc.jpg?width=400', false),
(19653588, 'Dods', 'Medium Dods sauce cup', 70, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/0494628a-4ff7-4043-820a-38e845c3694e.jpg?width=400', false),
(19653588, 'Come Back', 'Medium come back sauce cup', 70, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/db641c1d-1022-4529-8bed-66b72033adf0.jpg?width=400', false),
(19653588, 'Comeback', 'Small comeback cup with sauce', 40, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/58c9f90d-fffe-4c7d-abe5-471f70ac46c5.jpg?width=400', false),
(19653588, 'Barbecue', 'Small barbecue sauce cup', 35, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/78bddf3e-14be-4a09-b0d2-59b9f23c8919.jpg?width=400', false),
(19653588, 'Barbecue', 'Medium barbecue sauce cup', 55, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/6d95cb47-3ce4-4938-8dd5-a5d8e563c4fc.jpg?width=400', false),
(19653588, 'Smoky', 'Small smoky sauce cup', 40, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/68594202-87f3-434f-86d9-c6c682ee0ac6.jpg?width=400', false),
(19653588, 'Smoky', 'Medium smoky sauce cup', 65, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/8e69dd4a-ccf7-46d4-98ee-919448a1fe89.jpg?width=400', false),
(19653588, 'Buffalo', 'Small buffalo sauce cup', 40, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/ff88b4ed-61de-46a7-a881-5b20d7e00b32.jpg?width=400', false),
(19653588, 'Buffalo', 'Medium buffalo sauce cup', 65, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/c9671477-9d70-41d5-9a94-cd1822f7454e.jpg?width=400', false),
(19653588, 'Cheddar', 'Small cup of cheddar sauce.', 45, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771283/product/157f44b2-37ff-4f16-ad89-867519b9e5af.jpg?width=400', false),
(19653588, 'Cheddar', 'Medium cheddar sauce cup', 70, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771283/product/33567da1-e64a-475d-881b-011e640563f6.jpg?width=400', false),
(19653588, 'Tiger', 'Small Tiger sauce cup', 40, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771283/product/ceda0938-9425-4722-bfff-a7013538408f.jpg?width=400', false),
(19653588, 'Tiger', 'Medium Tiger sauce cup', 65, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771283/product/6f12d939-1761-4d92-a357-e371fc93c5d9.jpg?width=400', false),
(19653591, 'Brioche', 'Soft and buttery brioche bun.', 17, 'https://talabat.dhmedia.io/image/talabat/MenuItems/mmw_638943336047206091?width=400', false),
(19653591, 'Add Chicken Piece', 'Crispy chicken piece', 100, 'https://talabat.dhmedia.io/image/talabat/MenuItems/mmw_638943336112133668?width=400', false),
(19653591, 'Chicken Fillet', 'Crispy fillet piece', 100, 'https://talabat.dhmedia.io/image/talabat/MenuItems/mmw_638946582330610512?width=400', false),
(19653591, 'Tender Chicken', 'Crispy tender chicken', 75, 'https://talabat.dhmedia.io/image/talabat/MenuItems/mmw_638946582821151041?width=400', false),
(19653591, 'Large Plain Risotto', 'A generous portion of seasoned plain risotto', 50, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771237/product/2301413912/778b85ce-f630-448c-a684-985db6c45ad5.jpg?width=400', false),
(19653591, 'Coleslaw', 'Medium coleslaw cup', 50, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/0a9d44c7-701a-444d-911e-8dabaebc5789.jpg?width=400', false),
(19653591, 'Coleslaw', 'Small coleslaw cup', 40, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/1d50f8f8-9cd8-4819-959a-9e94c515b845.jpg?width=400', false),
(19653591, 'Coleslaw', 'Family-sized cup of coleslaw', 90, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/f5969d91-c527-4e21-a80f-98cac47256fa.jpg?width=400', false),
(19653591, 'Fries', 'Small fries bucket', 45, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771285/product/2a7ac851-b95e-49f5-a588-0c379d62e941.jpg?width=400', false),
(19653591, 'Fries', 'Medium fries', 65, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771237/product/847f3560-3a6e-432c-89ff-434f5b025a25.jpg?width=400', false),
(19653591, 'Fries', 'Family fries pack', 100, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771237/product/e72cca96-7d2d-4677-9669-95fb5d5c5979.jpg?width=400', false),
(19653591, 'Mozzarella Bomb', 'Piece of mozzarella bomb', 75, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771237/product/71bce1a5-323b-49e0-833b-5d0f52860eec.jpg?width=400', false),
(19653591, 'Cheddar Sticks', 'Box of three spicy cheddar sticks.', 75, 'https://talabat.dhmedia.io/image/global-menu-service/HF_EG/vendor/771283/product/f334924b-0f9b-4517-9280-cd6dc4c908e9.jpg?width=400', false),
(19653593, 'Water', 'Bottled drinking water', 15, 'https://talabat.dhmedia.io/image/talabat/MenuItems/WhatsApp_Image_20250918_a638938043157873854.jpeg?width=400', false),
(19653593, 'Fi Cola', 'Soft drink.', 35, 'https://talabat.dhmedia.io/image/talabat/MenuItems/WhatsApp_Image_20250918_a638938043011836257.jpeg?width=400', false),
(19653593, 'Apple Juice', 'Fresh apple juice.', 25, 'https://talabat.dhmedia.io/image/talabat/MenuItems/WhatsApp_Image_20250918_a638938042848143761.jpeg?width=400', false),
(19653593, '1 Liter Maxi Drink', 'Large 1 liter soft drink', 50, 'https://talabat.dhmedia.io/image/talabat/MenuItems/mmw_638938074328282749?width=400', false);

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
        (v_oid, (SELECT id FROM products WHERE name='4 Buffalo Ranch Chicken Wings' LIMIT 1), '4 Buffalo Ranch Chicken Wings', 85, 1, 85),
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
        (v_oid, (SELECT id FROM products WHERE name='6 Smoked Chicken Wings' LIMIT 1), '6 Smoked Chicken Wings', 115, 1, 115),
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
        (v_oid, (SELECT id FROM products WHERE name='Sriracha Chicken Wings' LIMIT 1), 'Sriracha Chicken Wings', 115, 1, 115),
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
        (v_oid, (SELECT id FROM products WHERE name='Sriracha Chicken Wings' LIMIT 1), 'Sriracha Chicken Wings', 115, 1, 115),
        (v_oid, (SELECT id FROM products WHERE name='Ranch' LIMIT 1), 'Ranch', 40, 1, 40);

    -- Recompute order totals so they exactly match the sum of their items
    UPDATE orders o SET total = COALESCE((SELECT SUM(subtotal) FROM order_items WHERE order_id = o.id), 0), updated_at = CURRENT_TIMESTAMP;
END $$;

-- ---------------------------------------------------------------------------
-- Talabat menu alignment (branch 771285 "Dodz", Heliopolis) + size-variant merges.
--
-- Ground truth is the live Talabat menu: every choice group below mirrors what
-- that branch actually sells (size radios, Make It Combo, bundle sandwich picks,
-- Original/Spicy chicken-type picks). Meals keep our piece-mix counters instead
-- of Talabat's single Original/Spicy pick -- a customer splits the fixed count
-- across flavours, and mixed meals get one counted pair per meat.
--
-- Prices are NOT changed to live Talabat prices: each cluster keeps our cheapest
-- variant as the base, and size deltas equal the live difference between sizes
-- (e.g. T Ranch stays 130, Double costs +75 because Talabat sells 260 vs 185).
--
-- Idempotent: re-running re-soft-deletes nothing already gone, re-renames nothing
-- already renamed, and rebuilds trees from scratch (wipe + insert).
-- ---------------------------------------------------------------------------

-- 1. Size-variant merges. The cheapest row of each cluster survives as the
--    canonical product (keeping its Talabat id and price as the base); larger
--    variants are soft-deleted because cart_items/order_items hold plain FKs
--    with no ON DELETE rule, and history must keep resolving. Matching is by
--    (name, price) because products carry no Talabat id column.
DO $merge$
DECLARE
    v_keep_id INTEGER;
BEGIN
    -- Fries
    SELECT min(id) INTO v_keep_id FROM products     WHERE name = 'Fries' AND price = 65 AND is_deleted = false AND is_modifier = false;
    IF v_keep_id IS NOT NULL THEN
        UPDATE products SET is_deleted = true, updated_at = CURRENT_TIMESTAMP WHERE id = v_keep_id;
    END IF;
    SELECT min(id) INTO v_keep_id FROM products     WHERE name = 'Fries' AND price = 100 AND is_deleted = false AND is_modifier = false;
    IF v_keep_id IS NOT NULL THEN
        UPDATE products SET is_deleted = true, updated_at = CURRENT_TIMESTAMP WHERE id = v_keep_id;
    END IF;
    SELECT min(id) INTO v_keep_id FROM products     WHERE name = 'Fries' AND price = 45       AND is_deleted = false AND is_modifier = false;
    IF v_keep_id IS NOT NULL THEN
        UPDATE products
           SET name = 'Fries',
               description = 'Crispy golden fries',
               updated_at = CURRENT_TIMESTAMP
         WHERE id = v_keep_id;
    END IF;

    -- Coleslaw
    SELECT min(id) INTO v_keep_id FROM products     WHERE name = 'Coleslaw' AND price = 50 AND is_deleted = false AND is_modifier = false;
    IF v_keep_id IS NOT NULL THEN
        UPDATE products SET is_deleted = true, updated_at = CURRENT_TIMESTAMP WHERE id = v_keep_id;
    END IF;
    SELECT min(id) INTO v_keep_id FROM products     WHERE name = 'Coleslaw' AND price = 90 AND is_deleted = false AND is_modifier = false;
    IF v_keep_id IS NOT NULL THEN
        UPDATE products SET is_deleted = true, updated_at = CURRENT_TIMESTAMP WHERE id = v_keep_id;
    END IF;
    SELECT min(id) INTO v_keep_id FROM products     WHERE name = 'Coleslaw' AND price = 40       AND is_deleted = false AND is_modifier = false;
    IF v_keep_id IS NOT NULL THEN
        UPDATE products
           SET name = 'Coleslaw',
               description = 'Fresh coleslaw',
               updated_at = CURRENT_TIMESTAMP
         WHERE id = v_keep_id;
    END IF;

    -- Hot Honey
    SELECT min(id) INTO v_keep_id FROM products     WHERE name = 'Hot Honey' AND price = 70 AND is_deleted = false AND is_modifier = false;
    IF v_keep_id IS NOT NULL THEN
        UPDATE products SET is_deleted = true, updated_at = CURRENT_TIMESTAMP WHERE id = v_keep_id;
    END IF;
    SELECT min(id) INTO v_keep_id FROM products     WHERE name = 'Hot Honey' AND price = 40       AND is_deleted = false AND is_modifier = false;
    IF v_keep_id IS NOT NULL THEN
        UPDATE products
           SET name = 'Hot Honey',
               description = 'Hot honey sauce cup',
               updated_at = CURRENT_TIMESTAMP
         WHERE id = v_keep_id;
    END IF;

    -- Ranch
    SELECT min(id) INTO v_keep_id FROM products     WHERE name = 'Ranch' AND price = 65 AND is_deleted = false AND is_modifier = false;
    IF v_keep_id IS NOT NULL THEN
        UPDATE products SET is_deleted = true, updated_at = CURRENT_TIMESTAMP WHERE id = v_keep_id;
    END IF;
    SELECT min(id) INTO v_keep_id FROM products     WHERE name = 'Ranch' AND price = 40       AND is_deleted = false AND is_modifier = false;
    IF v_keep_id IS NOT NULL THEN
        UPDATE products
           SET name = 'Ranch',
               description = 'Ranch sauce cup',
               updated_at = CURRENT_TIMESTAMP
         WHERE id = v_keep_id;
    END IF;

    -- Sriracha Mayo
    SELECT min(id) INTO v_keep_id FROM products     WHERE name = 'Sriracha Mayo' AND price = 65 AND is_deleted = false AND is_modifier = false;
    IF v_keep_id IS NOT NULL THEN
        UPDATE products SET is_deleted = true, updated_at = CURRENT_TIMESTAMP WHERE id = v_keep_id;
    END IF;
    SELECT min(id) INTO v_keep_id FROM products     WHERE name = 'Sriracha Mayo' AND price = 45       AND is_deleted = false AND is_modifier = false;
    IF v_keep_id IS NOT NULL THEN
        UPDATE products
           SET name = 'Sriracha Mayo',
               description = 'Sriracha mayo sauce cup',
               updated_at = CURRENT_TIMESTAMP
         WHERE id = v_keep_id;
    END IF;

    -- Doods
    SELECT min(id) INTO v_keep_id FROM products     WHERE name = 'Dods' AND price = 70 AND is_deleted = false AND is_modifier = false;
    IF v_keep_id IS NOT NULL THEN
        UPDATE products SET is_deleted = true, updated_at = CURRENT_TIMESTAMP WHERE id = v_keep_id;
    END IF;
    SELECT min(id) INTO v_keep_id FROM products     WHERE name = 'Doods' AND price = 40       AND is_deleted = false AND is_modifier = false;
    IF v_keep_id IS NOT NULL THEN
        UPDATE products
           SET name = 'Doods',
               description = 'Doods sauce cup',
               updated_at = CURRENT_TIMESTAMP
         WHERE id = v_keep_id;
    END IF;

    -- Comeback
    SELECT min(id) INTO v_keep_id FROM products     WHERE name = 'Come Back' AND price = 70 AND is_deleted = false AND is_modifier = false;
    IF v_keep_id IS NOT NULL THEN
        UPDATE products SET is_deleted = true, updated_at = CURRENT_TIMESTAMP WHERE id = v_keep_id;
    END IF;
    SELECT min(id) INTO v_keep_id FROM products     WHERE name = 'Comeback' AND price = 40       AND is_deleted = false AND is_modifier = false;
    IF v_keep_id IS NOT NULL THEN
        UPDATE products
           SET name = 'Comeback',
               description = 'Comeback sauce cup',
               updated_at = CURRENT_TIMESTAMP
         WHERE id = v_keep_id;
    END IF;

    -- Barbecue
    SELECT min(id) INTO v_keep_id FROM products     WHERE name = 'Barbecue' AND price = 55 AND is_deleted = false AND is_modifier = false;
    IF v_keep_id IS NOT NULL THEN
        UPDATE products SET is_deleted = true, updated_at = CURRENT_TIMESTAMP WHERE id = v_keep_id;
    END IF;
    SELECT min(id) INTO v_keep_id FROM products     WHERE name = 'Barbecue' AND price = 35       AND is_deleted = false AND is_modifier = false;
    IF v_keep_id IS NOT NULL THEN
        UPDATE products
           SET name = 'Barbecue',
               description = 'Barbecue sauce cup',
               updated_at = CURRENT_TIMESTAMP
         WHERE id = v_keep_id;
    END IF;

    -- Smoky
    SELECT min(id) INTO v_keep_id FROM products     WHERE name = 'Smoky' AND price = 65 AND is_deleted = false AND is_modifier = false;
    IF v_keep_id IS NOT NULL THEN
        UPDATE products SET is_deleted = true, updated_at = CURRENT_TIMESTAMP WHERE id = v_keep_id;
    END IF;
    SELECT min(id) INTO v_keep_id FROM products     WHERE name = 'Smoky' AND price = 40       AND is_deleted = false AND is_modifier = false;
    IF v_keep_id IS NOT NULL THEN
        UPDATE products
           SET name = 'Smoky',
               description = 'Smoky sauce cup',
               updated_at = CURRENT_TIMESTAMP
         WHERE id = v_keep_id;
    END IF;

    -- Buffalo
    SELECT min(id) INTO v_keep_id FROM products     WHERE name = 'Buffalo' AND price = 65 AND is_deleted = false AND is_modifier = false;
    IF v_keep_id IS NOT NULL THEN
        UPDATE products SET is_deleted = true, updated_at = CURRENT_TIMESTAMP WHERE id = v_keep_id;
    END IF;
    SELECT min(id) INTO v_keep_id FROM products     WHERE name = 'Buffalo' AND price = 40       AND is_deleted = false AND is_modifier = false;
    IF v_keep_id IS NOT NULL THEN
        UPDATE products
           SET name = 'Buffalo',
               description = 'Buffalo sauce cup',
               updated_at = CURRENT_TIMESTAMP
         WHERE id = v_keep_id;
    END IF;

    -- Cheddar
    SELECT min(id) INTO v_keep_id FROM products     WHERE name = 'Cheddar' AND price = 70 AND is_deleted = false AND is_modifier = false;
    IF v_keep_id IS NOT NULL THEN
        UPDATE products SET is_deleted = true, updated_at = CURRENT_TIMESTAMP WHERE id = v_keep_id;
    END IF;
    SELECT min(id) INTO v_keep_id FROM products     WHERE name = 'Cheddar' AND price = 45       AND is_deleted = false AND is_modifier = false;
    IF v_keep_id IS NOT NULL THEN
        UPDATE products
           SET name = 'Cheddar',
               description = 'Cheddar sauce cup',
               updated_at = CURRENT_TIMESTAMP
         WHERE id = v_keep_id;
    END IF;

    -- Tiger
    SELECT min(id) INTO v_keep_id FROM products     WHERE name = 'Tiger' AND price = 65 AND is_deleted = false AND is_modifier = false;
    IF v_keep_id IS NOT NULL THEN
        UPDATE products SET is_deleted = true, updated_at = CURRENT_TIMESTAMP WHERE id = v_keep_id;
    END IF;
    SELECT min(id) INTO v_keep_id FROM products     WHERE name = 'Tiger' AND price = 40       AND is_deleted = false AND is_modifier = false;
    IF v_keep_id IS NOT NULL THEN
        UPDATE products
           SET name = 'Tiger',
               description = 'Tiger sauce cup',
               updated_at = CURRENT_TIMESTAMP
         WHERE id = v_keep_id;
    END IF;

    -- Buffalo Ranch Chicken Wings
    SELECT min(id) INTO v_keep_id FROM products     WHERE name = '6 Buffalo Ranch Chicken Wings' AND price = 115 AND is_deleted = false AND is_modifier = false;
    IF v_keep_id IS NOT NULL THEN
        UPDATE products SET is_deleted = true, updated_at = CURRENT_TIMESTAMP WHERE id = v_keep_id;
    END IF;
    SELECT min(id) INTO v_keep_id FROM products     WHERE name = '4 Buffalo Ranch Chicken Wings' AND price = 85       AND is_deleted = false AND is_modifier = false;
    IF v_keep_id IS NOT NULL THEN
        UPDATE products
           SET name = 'Buffalo Ranch Chicken Wings',
               description = 'Crispy wings topped with buffalo and ranch sauce',
               updated_at = CURRENT_TIMESTAMP
         WHERE id = v_keep_id;
    END IF;

    -- Hot Honey Chicken Wings
    SELECT min(id) INTO v_keep_id FROM products     WHERE name = '6 Spicy Honey Chicken Wings' AND price = 115 AND is_deleted = false AND is_modifier = false;
    IF v_keep_id IS NOT NULL THEN
        UPDATE products SET is_deleted = true, updated_at = CURRENT_TIMESTAMP WHERE id = v_keep_id;
    END IF;
    SELECT min(id) INTO v_keep_id FROM products     WHERE name = '4 Pcs Hot Honey Chicken Wings' AND price = 85       AND is_deleted = false AND is_modifier = false;
    IF v_keep_id IS NOT NULL THEN
        UPDATE products
           SET name = 'Hot Honey Chicken Wings',
               description = 'Crispy chicken wing pieces coated in hot honey sauce',
               updated_at = CURRENT_TIMESTAMP
         WHERE id = v_keep_id;
    END IF;

    -- Smoked Chicken Wings
    SELECT min(id) INTO v_keep_id FROM products     WHERE name = '6 Smoked Chicken Wings' AND price = 115 AND is_deleted = false AND is_modifier = false;
    IF v_keep_id IS NOT NULL THEN
        UPDATE products SET is_deleted = true, updated_at = CURRENT_TIMESTAMP WHERE id = v_keep_id;
    END IF;
    SELECT min(id) INTO v_keep_id FROM products     WHERE name = '4 Smoked Chicken Wings' AND price = 85       AND is_deleted = false AND is_modifier = false;
    IF v_keep_id IS NOT NULL THEN
        UPDATE products
           SET name = 'Smoked Chicken Wings',
               description = 'Crispy chicken wings pieces covered with smoky sauce',
               updated_at = CURRENT_TIMESTAMP
         WHERE id = v_keep_id;
    END IF;

    -- Sriracha Mayo Chicken Wings
    SELECT min(id) INTO v_keep_id FROM products     WHERE name = 'Sriracha Chicken Wings' AND price = 115 AND is_deleted = false AND is_modifier = false;
    IF v_keep_id IS NOT NULL THEN
        UPDATE products SET is_deleted = true, updated_at = CURRENT_TIMESTAMP WHERE id = v_keep_id;
    END IF;
    SELECT min(id) INTO v_keep_id FROM products     WHERE name = '4 Sriracha Mayo Chicken Wings' AND price = 85       AND is_deleted = false AND is_modifier = false;
    IF v_keep_id IS NOT NULL THEN
        UPDATE products
           SET name = 'Sriracha Mayo Chicken Wings',
               description = 'Crispy chicken wing pieces coated with sriracha mayonnaise sauce.',
               updated_at = CURRENT_TIMESTAMP
         WHERE id = v_keep_id;
    END IF;

END $merge$;

-- 2. Rebuild option trees to match the live menu. Existing trees are wiped for
--    every product in the list below -- including trees an admin may have edited
--    -- because this migration's whole purpose is to replace them with the
--    Talabat shapes. Build Your Own Burger is deliberately NOT in the list: it is
--    an admin-created product that does not exist on Talabat.
DO $trees$
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
          }
        ]
        $json$::jsonb)
    LOOP
        SELECT min(p.id) INTO v_product_id
        FROM products p
        WHERE p.name = v_def->>'product' AND p.is_deleted = false AND p.is_modifier = false;

        IF v_product_id IS NULL THEN
            CONTINUE;
        END IF;

        DELETE FROM product_options WHERE product_id = v_product_id;

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

        -- Wire counted pairs together once both halves exist.
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

    -- Kids Fried Chicken Piece is a plain single-piece meal on Talabat: no tree.
    DELETE FROM product_options po
    USING products p
    WHERE po.product_id = p.id
      AND p.name = 'Kids Fried Chicken Piece'
      AND p.is_deleted = false;
END $trees$;

-- 3. Reconcile the flag: is_customizable mirrors "has an option tree".
UPDATE products p
SET is_customizable = (EXISTS (SELECT 1 FROM product_options po WHERE po.product_id = p.id)),
    updated_at = CURRENT_TIMESTAMP
WHERE p.is_modifier = false
  AND p.is_deleted = false
  AND p.is_customizable <> (EXISTS (SELECT 1 FROM product_options po WHERE po.product_id = p.id));

-- ============================================================
-- Travel360 ground-transport seed (trains + buses only)
--   - Removes junk partner id=18 ("ss") if it has no inventory.
--   - Adds 3 new TRANSPORT operators (IRCTC, RedBus, VRL Travels)
--     idempotently.
--   - Seeds 8 inventory rows across new item types:
--       TRAIN (4), BUS (4).
--   - BIKE + AUTO inventory were removed from scope; do not re-add.
--   - Idempotent on re-run: partner inserts gated by WHERE NOT EXISTS
--     by name; inventory inserts use the same guard.
-- ============================================================
USE inventory_db;

-- ---------- Cleanup: junk partner ----------
DELETE FROM partners
  WHERE partner_id = 18
    AND NOT EXISTS (SELECT 1 FROM inventories WHERE partner_id = 18);

-- ---------- Partners (idempotent) ----------
INSERT INTO partners (name, type, status, created_at, created_by)
  SELECT 'IRCTC', 'TRANSPORT', 'ACTIVE', NOW(), 'system'
  WHERE NOT EXISTS (SELECT 1 FROM partners WHERE name = 'IRCTC');
INSERT INTO partners (name, type, status, created_at, created_by)
  SELECT 'RedBus', 'TRANSPORT', 'ACTIVE', NOW(), 'system'
  WHERE NOT EXISTS (SELECT 1 FROM partners WHERE name = 'RedBus');
INSERT INTO partners (name, type, status, created_at, created_by)
  SELECT 'VRL Travels', 'TRANSPORT', 'ACTIVE', NOW(), 'system'
  WHERE NOT EXISTS (SELECT 1 FROM partners WHERE name = 'VRL Travels');

-- ---------- Resolve partner ids ----------
SET @irctc  = (SELECT partner_id FROM partners WHERE name = 'IRCTC' LIMIT 1);
SET @redbus = (SELECT partner_id FROM partners WHERE name = 'RedBus' LIMIT 1);
SET @vrl    = (SELECT partner_id FROM partners WHERE name = 'VRL Travels' LIMIT 1);

-- ============================================================
-- Inventory (idempotent — WHERE NOT EXISTS on name)
-- ============================================================

-- ---------- TRAIN (4, IRCTC) ----------
INSERT INTO inventories (partner_id, item_type, name, price, availability, status, details, created_at, created_by)
  SELECT @irctc, 'TRAIN', 'Train: Mumbai → Pune (AC Chair Car)', 450.00, 120, 'AVAILABLE',
         '{"from":"BOM","to":"PNQ","class":"AC Chair Car","departure":"06:30","arrival":"10:15","duration":"3h 45m","operator":"IRCTC"}',
         NOW(), 'system'
  WHERE NOT EXISTS (SELECT 1 FROM inventories WHERE name = 'Train: Mumbai → Pune (AC Chair Car)');
INSERT INTO inventories (partner_id, item_type, name, price, availability, status, details, created_at, created_by)
  SELECT @irctc, 'TRAIN', 'Train: Delhi → Agra (Shatabdi Exec)', 980.00, 150, 'AVAILABLE',
         '{"from":"DEL","to":"AGR","class":"Executive Class","departure":"06:00","arrival":"08:00","duration":"2h","operator":"IRCTC"}',
         NOW(), 'system'
  WHERE NOT EXISTS (SELECT 1 FROM inventories WHERE name = 'Train: Delhi → Agra (Shatabdi Exec)');
INSERT INTO inventories (partner_id, item_type, name, price, availability, status, details, created_at, created_by)
  SELECT @irctc, 'TRAIN', 'Train: Bangalore → Chennai (AC Sleeper)', 720.00, 200, 'AVAILABLE',
         '{"from":"BLR","to":"MAA","class":"AC Sleeper","departure":"22:30","arrival":"05:45","duration":"7h 15m","operator":"IRCTC"}',
         NOW(), 'system'
  WHERE NOT EXISTS (SELECT 1 FROM inventories WHERE name = 'Train: Bangalore → Chennai (AC Sleeper)');
INSERT INTO inventories (partner_id, item_type, name, price, availability, status, details, created_at, created_by)
  SELECT @irctc, 'TRAIN', 'Train: Mumbai → Ahmedabad (Tejas Exp)', 1100.00, 90, 'AVAILABLE',
         '{"from":"BOM","to":"AMD","class":"Premium AC","departure":"15:40","arrival":"22:30","duration":"6h 50m","operator":"IRCTC"}',
         NOW(), 'system'
  WHERE NOT EXISTS (SELECT 1 FROM inventories WHERE name = 'Train: Mumbai → Ahmedabad (Tejas Exp)');

-- ---------- BUS (4, RedBus + VRL) ----------
INSERT INTO inventories (partner_id, item_type, name, price, availability, status, details, created_at, created_by)
  SELECT @redbus, 'BUS', 'Bus: Delhi → Jaipur (Volvo AC Seater)', 550.00, 45, 'AVAILABLE',
         '{"from":"DEL","to":"JAI","vehicle":"Volvo AC Seater","departure":"23:00","duration":"5h 30m","operator":"RedBus"}',
         NOW(), 'system'
  WHERE NOT EXISTS (SELECT 1 FROM inventories WHERE name = 'Bus: Delhi → Jaipur (Volvo AC Seater)');
INSERT INTO inventories (partner_id, item_type, name, price, availability, status, details, created_at, created_by)
  SELECT @vrl, 'BUS', 'Bus: Bangalore → Chennai (AC Sleeper)', 720.00, 40, 'AVAILABLE',
         '{"from":"BLR","to":"MAA","vehicle":"AC Sleeper","departure":"22:00","duration":"6h","operator":"VRL Travels"}',
         NOW(), 'system'
  WHERE NOT EXISTS (SELECT 1 FROM inventories WHERE name = 'Bus: Bangalore → Chennai (AC Sleeper)');
INSERT INTO inventories (partner_id, item_type, name, price, availability, status, details, created_at, created_by)
  SELECT @redbus, 'BUS', 'Bus: Mumbai → Goa (Multi-Axle Volvo)', 950.00, 36, 'AVAILABLE',
         '{"from":"BOM","to":"GOI","vehicle":"Multi-Axle Volvo","departure":"21:00","duration":"12h","operator":"RedBus"}',
         NOW(), 'system'
  WHERE NOT EXISTS (SELECT 1 FROM inventories WHERE name = 'Bus: Mumbai → Goa (Multi-Axle Volvo)');
INSERT INTO inventories (partner_id, item_type, name, price, availability, status, details, created_at, created_by)
  SELECT @vrl, 'BUS', 'Bus: Pune → Hyderabad (Sleeper)', 880.00, 30, 'AVAILABLE',
         '{"from":"PNQ","to":"HYD","vehicle":"AC Sleeper","departure":"20:30","duration":"11h","operator":"VRL Travels"}',
         NOW(), 'system'
  WHERE NOT EXISTS (SELECT 1 FROM inventories WHERE name = 'Bus: Pune → Hyderabad (Sleeper)');

-- ---------- Verification ----------
SELECT item_type, COUNT(*) AS cnt FROM inventories GROUP BY item_type ORDER BY item_type;

-- ============================================================
-- Travel360 popular-route transport seed (trains + buses)
--   - Adds trains (IRCTC) and buses (RedBus / VRL Travels) on the
--     popular routes IN BOTH DIRECTIONS so search From/To matches.
--   - Uses ONLY existing partners (resolved by name -> session vars,
--     ids NOT hardcoded). Creates no new partners, no new enum values.
--   - details.from/to are CITY CODES (cities.js); names contain the
--     CITY NAMES so inventoryFilter matches on either.
--   - Every insert is idempotent: INSERT ... SELECT ... WHERE NOT
--     EXISTS (by exact name). Safe to re-run; no DELETE/TRUNCATE.
-- ============================================================
USE inventory_db;

-- ---------- Partners (idempotent; resolve, do not create new) ----------
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
-- TRAINS (IRCTC) — 20 rows, 10 routes x 2 directions
-- ============================================================

INSERT INTO inventories (partner_id, item_type, name, price, availability, status, details, created_at, created_by)
  SELECT @irctc, 'TRAIN', 'Train: Mumbai → Delhi (Rajdhani Exp)', 1850.00, 120, 'AVAILABLE',
         '{"from":"BOM","to":"DEL","departure":"16:00","arrival":"08:30","duration":"16h 30m","class":"AC 2 Tier","operator":"IRCTC"}',
         NOW(), 'system'
  WHERE NOT EXISTS (SELECT 1 FROM inventories WHERE name = 'Train: Mumbai → Delhi (Rajdhani Exp)');
INSERT INTO inventories (partner_id, item_type, name, price, availability, status, details, created_at, created_by)
  SELECT @irctc, 'TRAIN', 'Train: Delhi → Mumbai (Rajdhani Exp)', 1820.00, 110, 'AVAILABLE',
         '{"from":"DEL","to":"BOM","departure":"17:00","arrival":"09:55","duration":"16h 55m","class":"AC 2 Tier","operator":"IRCTC"}',
         NOW(), 'system'
  WHERE NOT EXISTS (SELECT 1 FROM inventories WHERE name = 'Train: Delhi → Mumbai (Rajdhani Exp)');

INSERT INTO inventories (partner_id, item_type, name, price, availability, status, details, created_at, created_by)
  SELECT @irctc, 'TRAIN', 'Train: Mumbai → Bangalore (Udyan Exp)', 1650.00, 90, 'AVAILABLE',
         '{"from":"BOM","to":"BLR","departure":"09:00","arrival":"09:15","duration":"24h 15m","class":"AC 3 Tier","operator":"IRCTC"}',
         NOW(), 'system'
  WHERE NOT EXISTS (SELECT 1 FROM inventories WHERE name = 'Train: Mumbai → Bangalore (Udyan Exp)');
INSERT INTO inventories (partner_id, item_type, name, price, availability, status, details, created_at, created_by)
  SELECT @irctc, 'TRAIN', 'Train: Bangalore → Mumbai (Udyan Exp)', 1600.00, 85, 'AVAILABLE',
         '{"from":"BLR","to":"BOM","departure":"14:00","arrival":"13:20","duration":"23h 20m","class":"AC 3 Tier","operator":"IRCTC"}',
         NOW(), 'system'
  WHERE NOT EXISTS (SELECT 1 FROM inventories WHERE name = 'Train: Bangalore → Mumbai (Udyan Exp)');

INSERT INTO inventories (partner_id, item_type, name, price, availability, status, details, created_at, created_by)
  SELECT @irctc, 'TRAIN', 'Train: Delhi → Bangalore (Rajdhani Exp)', 2000.00, 80, 'AVAILABLE',
         '{"from":"DEL","to":"BLR","departure":"20:30","arrival":"06:45","duration":"34h 15m","class":"AC 2 Tier","operator":"IRCTC"}',
         NOW(), 'system'
  WHERE NOT EXISTS (SELECT 1 FROM inventories WHERE name = 'Train: Delhi → Bangalore (Rajdhani Exp)');
INSERT INTO inventories (partner_id, item_type, name, price, availability, status, details, created_at, created_by)
  SELECT @irctc, 'TRAIN', 'Train: Bangalore → Delhi (Rajdhani Exp)', 1980.00, 75, 'AVAILABLE',
         '{"from":"BLR","to":"DEL","departure":"20:00","arrival":"05:55","duration":"33h 55m","class":"AC 2 Tier","operator":"IRCTC"}',
         NOW(), 'system'
  WHERE NOT EXISTS (SELECT 1 FROM inventories WHERE name = 'Train: Bangalore → Delhi (Rajdhani Exp)');

INSERT INTO inventories (partner_id, item_type, name, price, availability, status, details, created_at, created_by)
  SELECT @irctc, 'TRAIN', 'Train: Mumbai → Pune (Deccan Queen)', 620.00, 150, 'AVAILABLE',
         '{"from":"BOM","to":"PNQ","departure":"07:10","arrival":"10:35","duration":"3h 25m","class":"AC Chair Car","operator":"IRCTC"}',
         NOW(), 'system'
  WHERE NOT EXISTS (SELECT 1 FROM inventories WHERE name = 'Train: Mumbai → Pune (Deccan Queen)');
INSERT INTO inventories (partner_id, item_type, name, price, availability, status, details, created_at, created_by)
  SELECT @irctc, 'TRAIN', 'Train: Pune → Mumbai (Deccan Queen)', 620.00, 150, 'AVAILABLE',
         '{"from":"PNQ","to":"BOM","departure":"18:25","arrival":"21:40","duration":"3h 15m","class":"AC Chair Car","operator":"IRCTC"}',
         NOW(), 'system'
  WHERE NOT EXISTS (SELECT 1 FROM inventories WHERE name = 'Train: Pune → Mumbai (Deccan Queen)');

INSERT INTO inventories (partner_id, item_type, name, price, availability, status, details, created_at, created_by)
  SELECT @irctc, 'TRAIN', 'Train: Delhi → Jaipur (Shatabdi Exp)', 750.00, 140, 'AVAILABLE',
         '{"from":"DEL","to":"JAI","departure":"06:05","arrival":"10:35","duration":"4h 30m","class":"AC Chair Car","operator":"IRCTC"}',
         NOW(), 'system'
  WHERE NOT EXISTS (SELECT 1 FROM inventories WHERE name = 'Train: Delhi → Jaipur (Shatabdi Exp)');
INSERT INTO inventories (partner_id, item_type, name, price, availability, status, details, created_at, created_by)
  SELECT @irctc, 'TRAIN', 'Train: Jaipur → Delhi (Shatabdi Exp)', 750.00, 140, 'AVAILABLE',
         '{"from":"JAI","to":"DEL","departure":"17:50","arrival":"22:25","duration":"4h 35m","class":"AC Chair Car","operator":"IRCTC"}',
         NOW(), 'system'
  WHERE NOT EXISTS (SELECT 1 FROM inventories WHERE name = 'Train: Jaipur → Delhi (Shatabdi Exp)');

INSERT INTO inventories (partner_id, item_type, name, price, availability, status, details, created_at, created_by)
  SELECT @irctc, 'TRAIN', 'Train: Bangalore → Chennai (Shatabdi Exp)', 800.00, 130, 'AVAILABLE',
         '{"from":"BLR","to":"MAA","departure":"06:00","arrival":"11:00","duration":"5h 0m","class":"AC Chair Car","operator":"IRCTC"}',
         NOW(), 'system'
  WHERE NOT EXISTS (SELECT 1 FROM inventories WHERE name = 'Train: Bangalore → Chennai (Shatabdi Exp)');
INSERT INTO inventories (partner_id, item_type, name, price, availability, status, details, created_at, created_by)
  SELECT @irctc, 'TRAIN', 'Train: Chennai → Bangalore (Shatabdi Exp)', 800.00, 130, 'AVAILABLE',
         '{"from":"MAA","to":"BLR","departure":"16:00","arrival":"21:00","duration":"5h 0m","class":"AC Chair Car","operator":"IRCTC"}',
         NOW(), 'system'
  WHERE NOT EXISTS (SELECT 1 FROM inventories WHERE name = 'Train: Chennai → Bangalore (Shatabdi Exp)');

INSERT INTO inventories (partner_id, item_type, name, price, availability, status, details, created_at, created_by)
  SELECT @irctc, 'TRAIN', 'Train: Chennai → Kolkata (Coromandel Exp)', 1750.00, 70, 'AVAILABLE',
         '{"from":"MAA","to":"CCU","departure":"23:40","arrival":"04:20","duration":"28h 40m","class":"AC 2 Tier","operator":"IRCTC"}',
         NOW(), 'system'
  WHERE NOT EXISTS (SELECT 1 FROM inventories WHERE name = 'Train: Chennai → Kolkata (Coromandel Exp)');
INSERT INTO inventories (partner_id, item_type, name, price, availability, status, details, created_at, created_by)
  SELECT @irctc, 'TRAIN', 'Train: Kolkata → Chennai (Coromandel Exp)', 1750.00, 70, 'AVAILABLE',
         '{"from":"CCU","to":"MAA","departure":"14:50","arrival":"19:30","duration":"28h 40m","class":"AC 2 Tier","operator":"IRCTC"}',
         NOW(), 'system'
  WHERE NOT EXISTS (SELECT 1 FROM inventories WHERE name = 'Train: Kolkata → Chennai (Coromandel Exp)');

INSERT INTO inventories (partner_id, item_type, name, price, availability, status, details, created_at, created_by)
  SELECT @irctc, 'TRAIN', 'Train: Mumbai → Goa (Tejas Exp)', 1100.00, 110, 'AVAILABLE',
         '{"from":"BOM","to":"GOI","departure":"05:25","arrival":"16:00","duration":"10h 35m","class":"AC Chair Car","operator":"IRCTC"}',
         NOW(), 'system'
  WHERE NOT EXISTS (SELECT 1 FROM inventories WHERE name = 'Train: Mumbai → Goa (Tejas Exp)');
INSERT INTO inventories (partner_id, item_type, name, price, availability, status, details, created_at, created_by)
  SELECT @irctc, 'TRAIN', 'Train: Goa → Mumbai (Tejas Exp)', 1100.00, 110, 'AVAILABLE',
         '{"from":"GOI","to":"BOM","departure":"14:30","arrival":"23:25","duration":"8h 55m","class":"AC Chair Car","operator":"IRCTC"}',
         NOW(), 'system'
  WHERE NOT EXISTS (SELECT 1 FROM inventories WHERE name = 'Train: Goa → Mumbai (Tejas Exp)');

INSERT INTO inventories (partner_id, item_type, name, price, availability, status, details, created_at, created_by)
  SELECT @irctc, 'TRAIN', 'Train: Delhi → Hyderabad (Telangana Exp)', 1700.00, 85, 'AVAILABLE',
         '{"from":"DEL","to":"HYD","departure":"15:55","arrival":"16:00","duration":"24h 5m","class":"AC 3 Tier","operator":"IRCTC"}',
         NOW(), 'system'
  WHERE NOT EXISTS (SELECT 1 FROM inventories WHERE name = 'Train: Delhi → Hyderabad (Telangana Exp)');
INSERT INTO inventories (partner_id, item_type, name, price, availability, status, details, created_at, created_by)
  SELECT @irctc, 'TRAIN', 'Train: Hyderabad → Delhi (Telangana Exp)', 1700.00, 85, 'AVAILABLE',
         '{"from":"HYD","to":"DEL","departure":"06:05","arrival":"06:40","duration":"24h 35m","class":"AC 3 Tier","operator":"IRCTC"}',
         NOW(), 'system'
  WHERE NOT EXISTS (SELECT 1 FROM inventories WHERE name = 'Train: Hyderabad → Delhi (Telangana Exp)');

INSERT INTO inventories (partner_id, item_type, name, price, availability, status, details, created_at, created_by)
  SELECT @irctc, 'TRAIN', 'Train: Mumbai → Ahmedabad (Rajdhani Exp)', 1050.00, 120, 'AVAILABLE',
         '{"from":"BOM","to":"AMD","departure":"06:25","arrival":"12:55","duration":"6h 30m","class":"AC Chair Car","operator":"IRCTC"}',
         NOW(), 'system'
  WHERE NOT EXISTS (SELECT 1 FROM inventories WHERE name = 'Train: Mumbai → Ahmedabad (Rajdhani Exp)');
INSERT INTO inventories (partner_id, item_type, name, price, availability, status, details, created_at, created_by)
  SELECT @irctc, 'TRAIN', 'Train: Ahmedabad → Mumbai (Shatabdi Exp)', 1050.00, 120, 'AVAILABLE',
         '{"from":"AMD","to":"BOM","departure":"14:20","arrival":"21:05","duration":"6h 45m","class":"AC Chair Car","operator":"IRCTC"}',
         NOW(), 'system'
  WHERE NOT EXISTS (SELECT 1 FROM inventories WHERE name = 'Train: Ahmedabad → Mumbai (Shatabdi Exp)');

-- ============================================================
-- BUSES (RedBus / VRL Travels) — 20 rows, 10 routes x 2 directions
-- ============================================================

INSERT INTO inventories (partner_id, item_type, name, price, availability, status, details, created_at, created_by)
  SELECT @redbus, 'BUS', 'Bus: Mumbai → Delhi (Volvo AC Sleeper)', 1450.00, 50, 'AVAILABLE',
         '{"from":"BOM","to":"DEL","departure":"15:00","duration":"23h 30m","vehicle":"Volvo AC Sleeper","operator":"RedBus"}',
         NOW(), 'system'
  WHERE NOT EXISTS (SELECT 1 FROM inventories WHERE name = 'Bus: Mumbai → Delhi (Volvo AC Sleeper)');
INSERT INTO inventories (partner_id, item_type, name, price, availability, status, details, created_at, created_by)
  SELECT @vrl, 'BUS', 'Bus: Delhi → Mumbai (Volvo AC Sleeper)', 1450.00, 48, 'AVAILABLE',
         '{"from":"DEL","to":"BOM","departure":"16:00","duration":"23h 45m","vehicle":"Volvo AC Sleeper","operator":"VRL Travels"}',
         NOW(), 'system'
  WHERE NOT EXISTS (SELECT 1 FROM inventories WHERE name = 'Bus: Delhi → Mumbai (Volvo AC Sleeper)');

INSERT INTO inventories (partner_id, item_type, name, price, availability, status, details, created_at, created_by)
  SELECT @redbus, 'BUS', 'Bus: Mumbai → Bangalore (Volvo AC Sleeper)', 1350.00, 55, 'AVAILABLE',
         '{"from":"BOM","to":"BLR","departure":"17:30","duration":"17h 0m","vehicle":"Volvo AC Sleeper","operator":"RedBus"}',
         NOW(), 'system'
  WHERE NOT EXISTS (SELECT 1 FROM inventories WHERE name = 'Bus: Mumbai → Bangalore (Volvo AC Sleeper)');
INSERT INTO inventories (partner_id, item_type, name, price, availability, status, details, created_at, created_by)
  SELECT @vrl, 'BUS', 'Bus: Bangalore → Mumbai (Volvo AC Sleeper)', 1350.00, 52, 'AVAILABLE',
         '{"from":"BLR","to":"BOM","departure":"18:00","duration":"17h 15m","vehicle":"Volvo AC Sleeper","operator":"VRL Travels"}',
         NOW(), 'system'
  WHERE NOT EXISTS (SELECT 1 FROM inventories WHERE name = 'Bus: Bangalore → Mumbai (Volvo AC Sleeper)');

INSERT INTO inventories (partner_id, item_type, name, price, availability, status, details, created_at, created_by)
  SELECT @redbus, 'BUS', 'Bus: Delhi → Bangalore (Volvo AC Sleeper)', 1500.00, 40, 'AVAILABLE',
         '{"from":"DEL","to":"BLR","departure":"14:00","duration":"34h 0m","vehicle":"Volvo AC Sleeper","operator":"RedBus"}',
         NOW(), 'system'
  WHERE NOT EXISTS (SELECT 1 FROM inventories WHERE name = 'Bus: Delhi → Bangalore (Volvo AC Sleeper)');
INSERT INTO inventories (partner_id, item_type, name, price, availability, status, details, created_at, created_by)
  SELECT @vrl, 'BUS', 'Bus: Bangalore → Delhi (Volvo AC Sleeper)', 1500.00, 40, 'AVAILABLE',
         '{"from":"BLR","to":"DEL","departure":"13:30","duration":"34h 30m","vehicle":"Volvo AC Sleeper","operator":"VRL Travels"}',
         NOW(), 'system'
  WHERE NOT EXISTS (SELECT 1 FROM inventories WHERE name = 'Bus: Bangalore → Delhi (Volvo AC Sleeper)');

INSERT INTO inventories (partner_id, item_type, name, price, availability, status, details, created_at, created_by)
  SELECT @redbus, 'BUS', 'Bus: Mumbai → Pune (Volvo AC Seater)', 500.00, 90, 'AVAILABLE',
         '{"from":"BOM","to":"PNQ","departure":"08:00","duration":"3h 30m","vehicle":"Volvo AC Seater","operator":"RedBus"}',
         NOW(), 'system'
  WHERE NOT EXISTS (SELECT 1 FROM inventories WHERE name = 'Bus: Mumbai → Pune (Volvo AC Seater)');
INSERT INTO inventories (partner_id, item_type, name, price, availability, status, details, created_at, created_by)
  SELECT @vrl, 'BUS', 'Bus: Pune → Mumbai (Volvo AC Seater)', 500.00, 90, 'AVAILABLE',
         '{"from":"PNQ","to":"BOM","departure":"19:00","duration":"3h 30m","vehicle":"Volvo AC Seater","operator":"VRL Travels"}',
         NOW(), 'system'
  WHERE NOT EXISTS (SELECT 1 FROM inventories WHERE name = 'Bus: Pune → Mumbai (Volvo AC Seater)');

INSERT INTO inventories (partner_id, item_type, name, price, availability, status, details, created_at, created_by)
  SELECT @redbus, 'BUS', 'Bus: Delhi → Jaipur (Volvo AC Sleeper)', 650.00, 60, 'AVAILABLE',
         '{"from":"DEL","to":"JAI","departure":"23:00","duration":"5h 30m","vehicle":"Volvo AC Sleeper","operator":"RedBus"}',
         NOW(), 'system'
  WHERE NOT EXISTS (SELECT 1 FROM inventories WHERE name = 'Bus: Delhi → Jaipur (Volvo AC Sleeper)');
INSERT INTO inventories (partner_id, item_type, name, price, availability, status, details, created_at, created_by)
  SELECT @vrl, 'BUS', 'Bus: Jaipur → Delhi (Volvo AC Sleeper)', 650.00, 60, 'AVAILABLE',
         '{"from":"JAI","to":"DEL","departure":"22:30","duration":"5h 45m","vehicle":"Volvo AC Sleeper","operator":"VRL Travels"}',
         NOW(), 'system'
  WHERE NOT EXISTS (SELECT 1 FROM inventories WHERE name = 'Bus: Jaipur → Delhi (Volvo AC Sleeper)');

INSERT INTO inventories (partner_id, item_type, name, price, availability, status, details, created_at, created_by)
  SELECT @redbus, 'BUS', 'Bus: Bangalore → Chennai (Volvo AC Seater)', 720.00, 65, 'AVAILABLE',
         '{"from":"BLR","to":"MAA","departure":"22:00","duration":"6h 0m","vehicle":"Volvo AC Seater","operator":"RedBus"}',
         NOW(), 'system'
  WHERE NOT EXISTS (SELECT 1 FROM inventories WHERE name = 'Bus: Bangalore → Chennai (Volvo AC Seater)');
INSERT INTO inventories (partner_id, item_type, name, price, availability, status, details, created_at, created_by)
  SELECT @vrl, 'BUS', 'Bus: Chennai → Bangalore (Volvo AC Seater)', 720.00, 65, 'AVAILABLE',
         '{"from":"MAA","to":"BLR","departure":"23:00","duration":"6h 15m","vehicle":"Volvo AC Seater","operator":"VRL Travels"}',
         NOW(), 'system'
  WHERE NOT EXISTS (SELECT 1 FROM inventories WHERE name = 'Bus: Chennai → Bangalore (Volvo AC Seater)');

INSERT INTO inventories (partner_id, item_type, name, price, availability, status, details, created_at, created_by)
  SELECT @redbus, 'BUS', 'Bus: Chennai → Kolkata (Volvo AC Sleeper)', 1400.00, 42, 'AVAILABLE',
         '{"from":"MAA","to":"CCU","departure":"16:00","duration":"26h 0m","vehicle":"Volvo AC Sleeper","operator":"RedBus"}',
         NOW(), 'system'
  WHERE NOT EXISTS (SELECT 1 FROM inventories WHERE name = 'Bus: Chennai → Kolkata (Volvo AC Sleeper)');
INSERT INTO inventories (partner_id, item_type, name, price, availability, status, details, created_at, created_by)
  SELECT @vrl, 'BUS', 'Bus: Kolkata → Chennai (Volvo AC Sleeper)', 1400.00, 42, 'AVAILABLE',
         '{"from":"CCU","to":"MAA","departure":"15:00","duration":"26h 30m","vehicle":"Volvo AC Sleeper","operator":"VRL Travels"}',
         NOW(), 'system'
  WHERE NOT EXISTS (SELECT 1 FROM inventories WHERE name = 'Bus: Kolkata → Chennai (Volvo AC Sleeper)');

INSERT INTO inventories (partner_id, item_type, name, price, availability, status, details, created_at, created_by)
  SELECT @redbus, 'BUS', 'Bus: Mumbai → Goa (Volvo AC Sleeper)', 950.00, 50, 'AVAILABLE',
         '{"from":"BOM","to":"GOI","departure":"20:30","duration":"11h 30m","vehicle":"Volvo AC Sleeper","operator":"RedBus"}',
         NOW(), 'system'
  WHERE NOT EXISTS (SELECT 1 FROM inventories WHERE name = 'Bus: Mumbai → Goa (Volvo AC Sleeper)');
INSERT INTO inventories (partner_id, item_type, name, price, availability, status, details, created_at, created_by)
  SELECT @vrl, 'BUS', 'Bus: Goa → Mumbai (Volvo AC Sleeper)', 950.00, 50, 'AVAILABLE',
         '{"from":"GOI","to":"BOM","departure":"19:30","duration":"11h 45m","vehicle":"Volvo AC Sleeper","operator":"VRL Travels"}',
         NOW(), 'system'
  WHERE NOT EXISTS (SELECT 1 FROM inventories WHERE name = 'Bus: Goa → Mumbai (Volvo AC Sleeper)');

INSERT INTO inventories (partner_id, item_type, name, price, availability, status, details, created_at, created_by)
  SELECT @redbus, 'BUS', 'Bus: Delhi → Hyderabad (Volvo AC Sleeper)', 1300.00, 45, 'AVAILABLE',
         '{"from":"DEL","to":"HYD","departure":"13:00","duration":"26h 0m","vehicle":"Volvo AC Sleeper","operator":"RedBus"}',
         NOW(), 'system'
  WHERE NOT EXISTS (SELECT 1 FROM inventories WHERE name = 'Bus: Delhi → Hyderabad (Volvo AC Sleeper)');
INSERT INTO inventories (partner_id, item_type, name, price, availability, status, details, created_at, created_by)
  SELECT @vrl, 'BUS', 'Bus: Hyderabad → Delhi (Volvo AC Sleeper)', 1300.00, 45, 'AVAILABLE',
         '{"from":"HYD","to":"DEL","departure":"12:30","duration":"26h 30m","vehicle":"Volvo AC Sleeper","operator":"VRL Travels"}',
         NOW(), 'system'
  WHERE NOT EXISTS (SELECT 1 FROM inventories WHERE name = 'Bus: Hyderabad → Delhi (Volvo AC Sleeper)');

INSERT INTO inventories (partner_id, item_type, name, price, availability, status, details, created_at, created_by)
  SELECT @redbus, 'BUS', 'Bus: Mumbai → Ahmedabad (Volvo AC Sleeper)', 850.00, 55, 'AVAILABLE',
         '{"from":"BOM","to":"AMD","departure":"22:00","duration":"9h 30m","vehicle":"Volvo AC Sleeper","operator":"RedBus"}',
         NOW(), 'system'
  WHERE NOT EXISTS (SELECT 1 FROM inventories WHERE name = 'Bus: Mumbai → Ahmedabad (Volvo AC Sleeper)');
INSERT INTO inventories (partner_id, item_type, name, price, availability, status, details, created_at, created_by)
  SELECT @vrl, 'BUS', 'Bus: Ahmedabad → Mumbai (Volvo AC Sleeper)', 850.00, 55, 'AVAILABLE',
         '{"from":"AMD","to":"BOM","departure":"21:30","duration":"9h 45m","vehicle":"Volvo AC Sleeper","operator":"VRL Travels"}',
         NOW(), 'system'
  WHERE NOT EXISTS (SELECT 1 FROM inventories WHERE name = 'Bus: Ahmedabad → Mumbai (Volvo AC Sleeper)');

-- ---------- Verification ----------
SELECT item_type, COUNT(*) FROM inventories GROUP BY item_type;

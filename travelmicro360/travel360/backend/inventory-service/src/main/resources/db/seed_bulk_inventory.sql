-- ============================================================
-- Travel360 bulk inventory seed (demo data)
--   25 flights + 20 hotels + 15 transport = 60 inventory rows
--   Adds missing partners only if absent (idempotent on partners).
--   Inventory inserts are NOT idempotent: do not run twice.
-- ============================================================
USE inventory_db;

-- ---------- 1. Partners (insert only if absent) ----------
INSERT INTO partners (name, type, status, created_at, created_by)
  SELECT 'Akasa Air', 'AIRLINE', 'ACTIVE', NOW(), 'system'
  WHERE NOT EXISTS (SELECT 1 FROM partners WHERE name='Akasa Air');
INSERT INTO partners (name, type, status, created_at, created_by)
  SELECT 'Trident Hotels', 'HOTEL', 'ACTIVE', NOW(), 'system'
  WHERE NOT EXISTS (SELECT 1 FROM partners WHERE name='Trident Hotels');
INSERT INTO partners (name, type, status, created_at, created_by)
  SELECT 'The Leela', 'HOTEL', 'ACTIVE', NOW(), 'system'
  WHERE NOT EXISTS (SELECT 1 FROM partners WHERE name='The Leela');
INSERT INTO partners (name, type, status, created_at, created_by)
  SELECT 'Ola Outstation', 'TRANSPORT', 'ACTIVE', NOW(), 'system'
  WHERE NOT EXISTS (SELECT 1 FROM partners WHERE name='Ola Outstation');
INSERT INTO partners (name, type, status, created_at, created_by)
  SELECT 'MakeMyTrip Cabs', 'TRANSPORT', 'ACTIVE', NOW(), 'system'
  WHERE NOT EXISTS (SELECT 1 FROM partners WHERE name='MakeMyTrip Cabs');

-- ---------- 2. Resolve partner ids into session vars ----------
SET @air_india      = (SELECT partner_id FROM partners WHERE name='Air India' LIMIT 1);
SET @indigo         = (SELECT partner_id FROM partners WHERE name='IndiGo' LIMIT 1);
SET @vistara        = (SELECT partner_id FROM partners WHERE name='Vistara' LIMIT 1);
SET @spicejet       = (SELECT partner_id FROM partners WHERE name='SpiceJet' LIMIT 1);
SET @akasa          = (SELECT partner_id FROM partners WHERE name='Akasa Air' LIMIT 1);

SET @taj            = (SELECT partner_id FROM partners WHERE name='Taj Hotels' LIMIT 1);
SET @oberoi         = (SELECT partner_id FROM partners WHERE name='The Oberoi' LIMIT 1);
SET @marriott       = (SELECT partner_id FROM partners WHERE name='Marriott Hotels' LIMIT 1);
SET @trident        = (SELECT partner_id FROM partners WHERE name='Trident Hotels' LIMIT 1);
SET @itc            = (SELECT partner_id FROM partners WHERE name='ITC Hotels' LIMIT 1);
SET @leela          = (SELECT partner_id FROM partners WHERE name='The Leela' LIMIT 1);

SET @ola_outstation = (SELECT partner_id FROM partners WHERE name='Ola Outstation' LIMIT 1);
SET @uber           = (SELECT partner_id FROM partners WHERE name='Uber' LIMIT 1);
SET @mmt            = (SELECT partner_id FROM partners WHERE name='MakeMyTrip Cabs' LIMIT 1);

-- ============================================================
-- 3. FLIGHTS (25 rows)
-- ============================================================
INSERT INTO inventories (partner_id, item_type, name, price, availability, status, details, created_at, created_by) VALUES
-- BOM -> DEL (5)
(@indigo,    'FLIGHT', 'IndiGo BOM-DEL 06:15',    3800.00, 140, 'AVAILABLE', '{"from":"BOM","to":"DEL","departure":"06:15","arrival":"08:30","duration":"2h 15m","class":"Economy","baggage":"15kg"}', NOW(), 'system'),
(@air_india, 'FLIGHT', 'Air India BOM-DEL 08:30', 5400.00, 110, 'AVAILABLE', '{"from":"BOM","to":"DEL","departure":"08:30","arrival":"10:45","duration":"2h 15m","class":"Economy","baggage":"20kg"}', NOW(), 'system'),
(@vistara,   'FLIGHT', 'Vistara BOM-DEL 11:00',   6900.00,  90, 'AVAILABLE', '{"from":"BOM","to":"DEL","departure":"11:00","arrival":"13:15","duration":"2h 15m","class":"Premium Economy","baggage":"20kg"}', NOW(), 'system'),
(@spicejet,  'FLIGHT', 'SpiceJet BOM-DEL 14:15',  4200.00, 130, 'AVAILABLE', '{"from":"BOM","to":"DEL","departure":"14:15","arrival":"16:35","duration":"2h 20m","class":"Economy","baggage":"15kg"}', NOW(), 'system'),
(@akasa,     'FLIGHT', 'Akasa Air BOM-DEL 18:45', 8200.00,  60, 'AVAILABLE', '{"from":"BOM","to":"DEL","departure":"18:45","arrival":"21:00","duration":"2h 15m","class":"Business","baggage":"30kg"}', NOW(), 'system'),
-- DEL -> BOM (5)
(@indigo,    'FLIGHT', 'IndiGo DEL-BOM 07:00',    3500.00, 150, 'AVAILABLE', '{"from":"DEL","to":"BOM","departure":"07:00","arrival":"09:15","duration":"2h 15m","class":"Economy","baggage":"15kg"}', NOW(), 'system'),
(@air_india, 'FLIGHT', 'Air India DEL-BOM 10:30', 5800.00, 100, 'AVAILABLE', '{"from":"DEL","to":"BOM","departure":"10:30","arrival":"12:45","duration":"2h 15m","class":"Economy","baggage":"20kg"}', NOW(), 'system'),
(@vistara,   'FLIGHT', 'Vistara DEL-BOM 13:15',   7100.00,  80, 'AVAILABLE', '{"from":"DEL","to":"BOM","departure":"13:15","arrival":"15:30","duration":"2h 15m","class":"Premium Economy","baggage":"20kg"}', NOW(), 'system'),
(@spicejet,  'FLIGHT', 'SpiceJet DEL-BOM 16:00',  4500.00, 125, 'AVAILABLE', '{"from":"DEL","to":"BOM","departure":"16:00","arrival":"18:20","duration":"2h 20m","class":"Economy","baggage":"15kg"}', NOW(), 'system'),
(@akasa,     'FLIGHT', 'Akasa Air DEL-BOM 20:30', 8500.00,  55, 'AVAILABLE', '{"from":"DEL","to":"BOM","departure":"20:30","arrival":"22:45","duration":"2h 15m","class":"Business","baggage":"30kg"}', NOW(), 'system'),
-- BOM -> BLR (4)
(@indigo,    'FLIGHT', 'IndiGo BOM-BLR 05:45',    2800.00, 145, 'AVAILABLE', '{"from":"BOM","to":"BLR","departure":"05:45","arrival":"07:30","duration":"1h 45m","class":"Economy","baggage":"15kg"}', NOW(), 'system'),
(@air_india, 'FLIGHT', 'Air India BOM-BLR 09:15', 4500.00,  95, 'AVAILABLE', '{"from":"BOM","to":"BLR","departure":"09:15","arrival":"11:00","duration":"1h 45m","class":"Economy","baggage":"20kg"}', NOW(), 'system'),
(@vistara,   'FLIGHT', 'Vistara BOM-BLR 12:30',   5800.00,  70, 'AVAILABLE', '{"from":"BOM","to":"BLR","departure":"12:30","arrival":"14:15","duration":"1h 45m","class":"Premium Economy","baggage":"20kg"}', NOW(), 'system'),
(@spicejet,  'FLIGHT', 'SpiceJet BOM-BLR 17:45',  6500.00, 115, 'AVAILABLE', '{"from":"BOM","to":"BLR","departure":"17:45","arrival":"19:35","duration":"1h 50m","class":"Economy","baggage":"15kg"}', NOW(), 'system'),
-- BLR -> BOM (3)
(@indigo,    'FLIGHT', 'IndiGo BLR-BOM 06:30',    3200.00, 140, 'AVAILABLE', '{"from":"BLR","to":"BOM","departure":"06:30","arrival":"08:15","duration":"1h 45m","class":"Economy","baggage":"15kg"}', NOW(), 'system'),
(@vistara,   'FLIGHT', 'Vistara BLR-BOM 13:00',   5400.00,  75, 'AVAILABLE', '{"from":"BLR","to":"BOM","departure":"13:00","arrival":"14:45","duration":"1h 45m","class":"Premium Economy","baggage":"20kg"}', NOW(), 'system'),
(@air_india, 'FLIGHT', 'Air India BLR-BOM 19:15', 6500.00,  85, 'AVAILABLE', '{"from":"BLR","to":"BOM","departure":"19:15","arrival":"21:00","duration":"1h 45m","class":"Economy","baggage":"20kg"}', NOW(), 'system'),
-- DEL -> BLR (3)
(@indigo,    'FLIGHT', 'IndiGo DEL-BLR 07:15',    4500.00, 130, 'AVAILABLE', '{"from":"DEL","to":"BLR","departure":"07:15","arrival":"09:55","duration":"2h 40m","class":"Economy","baggage":"15kg"}', NOW(), 'system'),
(@vistara,   'FLIGHT', 'Vistara DEL-BLR 12:45',   7200.00,  65, 'AVAILABLE', '{"from":"DEL","to":"BLR","departure":"12:45","arrival":"15:30","duration":"2h 45m","class":"Premium Economy","baggage":"20kg"}', NOW(), 'system'),
(@air_india, 'FLIGHT', 'Air India DEL-BLR 18:00', 9000.00,  50, 'AVAILABLE', '{"from":"DEL","to":"BLR","departure":"18:00","arrival":"20:40","duration":"2h 40m","class":"Business","baggage":"30kg"}', NOW(), 'system'),
-- BLR -> HYD (2)
(@indigo,    'FLIGHT', 'IndiGo BLR-HYD 06:45',    2200.00, 150, 'AVAILABLE', '{"from":"BLR","to":"HYD","departure":"06:45","arrival":"07:55","duration":"1h 10m","class":"Economy","baggage":"15kg"}', NOW(), 'system'),
(@spicejet,  'FLIGHT', 'SpiceJet BLR-HYD 14:30',  4500.00, 110, 'AVAILABLE', '{"from":"BLR","to":"HYD","departure":"14:30","arrival":"15:45","duration":"1h 15m","class":"Economy","baggage":"15kg"}', NOW(), 'system'),
-- MAA -> CCU (2)
(@indigo,    'FLIGHT', 'IndiGo MAA-CCU 08:00',    4200.00, 100, 'AVAILABLE', '{"from":"MAA","to":"CCU","departure":"08:00","arrival":"10:25","duration":"2h 25m","class":"Economy","baggage":"15kg"}', NOW(), 'system'),
(@vistara,   'FLIGHT', 'Vistara MAA-CCU 16:30',   7500.00,  60, 'AVAILABLE', '{"from":"MAA","to":"CCU","departure":"16:30","arrival":"19:00","duration":"2h 30m","class":"Premium Economy","baggage":"20kg"}', NOW(), 'system'),
-- DEL -> GOI (1)
(@vistara,   'FLIGHT', 'Vistara DEL-GOI 11:30',   5500.00,  90, 'AVAILABLE', '{"from":"DEL","to":"GOI","departure":"11:30","arrival":"14:00","duration":"2h 30m","class":"Premium Economy","baggage":"20kg"}', NOW(), 'system');

-- ============================================================
-- 4. HOTELS (20 rows)
-- ============================================================
INSERT INTO inventories (partner_id, item_type, name, price, availability, status, details, created_at, created_by) VALUES
-- Mumbai (5)
(@taj,      'HOTEL', 'Taj Mahal Palace, Mumbai',   18000.00, 12, 'AVAILABLE', '{"city":"Mumbai","stars":5,"amenities":"WiFi,Pool,Gym,Spa,Restaurant","checkin":"14:00","checkout":"12:00","roomType":"Heritage Suite"}', NOW(), 'system'),
(@oberoi,   'HOTEL', 'The Oberoi Mumbai',          22000.00,  8, 'AVAILABLE', '{"city":"Mumbai","stars":5,"amenities":"WiFi,Pool,Gym,Spa,Butler","checkin":"14:00","checkout":"12:00","roomType":"Premier Sea View"}', NOW(), 'system'),
(@trident,  'HOTEL', 'Trident BKC, Mumbai',        12000.00, 22, 'AVAILABLE', '{"city":"Mumbai","stars":5,"amenities":"WiFi,Pool,Gym,Business Center","checkin":"14:00","checkout":"12:00","roomType":"Deluxe"}', NOW(), 'system'),
(@marriott, 'HOTEL', 'Marriott Sahar, Mumbai',      9500.00, 30, 'AVAILABLE', '{"city":"Mumbai","stars":5,"amenities":"WiFi,Pool,Gym,Airport Shuttle","checkin":"15:00","checkout":"12:00","roomType":"Deluxe King"}', NOW(), 'system'),
(@marriott, 'HOTEL', 'JW Marriott Juhu, Mumbai',   14000.00, 18, 'AVAILABLE', '{"city":"Mumbai","stars":5,"amenities":"WiFi,Pool,Gym,Spa,Beach Access","checkin":"15:00","checkout":"12:00","roomType":"Deluxe Sea View"}', NOW(), 'system'),
-- Delhi (4)
(@taj,      'HOTEL', 'Taj Palace, Delhi',          15000.00, 16, 'AVAILABLE', '{"city":"Delhi","stars":5,"amenities":"WiFi,Pool,Gym,Spa","checkin":"14:00","checkout":"12:00","roomType":"Deluxe"}', NOW(), 'system'),
(@marriott, 'HOTEL', 'Le Meridien Delhi',          11000.00, 25, 'AVAILABLE', '{"city":"Delhi","stars":5,"amenities":"WiFi,Pool,Gym,Restaurant","checkin":"15:00","checkout":"12:00","roomType":"Vista Room"}', NOW(), 'system'),
(@itc,      'HOTEL', 'ITC Maurya, Delhi',          17000.00, 14, 'AVAILABLE', '{"city":"Delhi","stars":5,"amenities":"WiFi,Pool,Gym,Spa,Bukhara Restaurant","checkin":"14:00","checkout":"12:00","roomType":"Executive Club"}', NOW(), 'system'),
(@trident,  'HOTEL', 'Roseate House, Delhi',        9000.00, 28, 'AVAILABLE', '{"city":"Delhi","stars":5,"amenities":"WiFi,Pool,Gym","checkin":"14:00","checkout":"12:00","roomType":"Studio Suite"}', NOW(), 'system'),
-- Bangalore (4)
(@leela,    'HOTEL', 'The Leela Palace Bangalore', 16000.00, 12, 'AVAILABLE', '{"city":"Bangalore","stars":5,"amenities":"WiFi,Pool,Gym,Spa,Palace Architecture","checkin":"14:00","checkout":"12:00","roomType":"Royal Premiere"}', NOW(), 'system'),
(@taj,      'HOTEL', 'Taj West End, Bangalore',    14500.00, 15, 'AVAILABLE', '{"city":"Bangalore","stars":5,"amenities":"WiFi,Pool,Gym,Spa,Heritage Gardens","checkin":"14:00","checkout":"12:00","roomType":"Heritage Wing"}', NOW(), 'system'),
(@itc,      'HOTEL', 'ITC Gardenia, Bangalore',    13000.00, 20, 'AVAILABLE', '{"city":"Bangalore","stars":5,"amenities":"WiFi,Pool,Gym,Spa,LEED Platinum","checkin":"14:00","checkout":"12:00","roomType":"Executive Club"}', NOW(), 'system'),
(@marriott, 'HOTEL', 'JW Marriott Bangalore',      10500.00, 24, 'AVAILABLE', '{"city":"Bangalore","stars":5,"amenities":"WiFi,Pool,Gym,Spa","checkin":"15:00","checkout":"12:00","roomType":"Deluxe King"}', NOW(), 'system'),
-- Chennai (2)
(@taj,      'HOTEL', 'Taj Coromandel, Chennai',    11000.00, 18, 'AVAILABLE', '{"city":"Chennai","stars":5,"amenities":"WiFi,Pool,Gym,Spa","checkin":"14:00","checkout":"12:00","roomType":"Deluxe"}', NOW(), 'system'),
(@itc,      'HOTEL', 'ITC Grand Chola, Chennai',   13500.00, 16, 'AVAILABLE', '{"city":"Chennai","stars":5,"amenities":"WiFi,Pool,Gym,Spa,Dakshin Restaurant","checkin":"14:00","checkout":"12:00","roomType":"Executive Club"}', NOW(), 'system'),
-- Hyderabad (2)
(@taj,      'HOTEL', 'Taj Falaknuma Palace, Hyderabad', 25000.00, 6, 'AVAILABLE', '{"city":"Hyderabad","stars":5,"amenities":"WiFi,Pool,Spa,Heritage Palace,Butler","checkin":"14:00","checkout":"12:00","roomType":"Palace Suite"}', NOW(), 'system'),
(@itc,      'HOTEL', 'ITC Kohenur, Hyderabad',     12000.00, 22, 'AVAILABLE', '{"city":"Hyderabad","stars":5,"amenities":"WiFi,Pool,Gym,Spa","checkin":"14:00","checkout":"12:00","roomType":"Executive Club"}', NOW(), 'system'),
-- Goa (2)
(@taj,      'HOTEL', 'Taj Exotica Resort, Goa',    19000.00, 10, 'AVAILABLE', '{"city":"Goa","stars":5,"amenities":"WiFi,Pool,Beach,Spa,Multiple Restaurants","checkin":"14:00","checkout":"12:00","roomType":"Deluxe Garden Villa"}', NOW(), 'system'),
(@marriott, 'HOTEL', 'Goa Marriott Resort & Spa',  15000.00, 14, 'AVAILABLE', '{"city":"Goa","stars":5,"amenities":"WiFi,Pool,Beach,Spa","checkin":"15:00","checkout":"12:00","roomType":"Resort View"}', NOW(), 'system'),
-- Kolkata (1)
(@oberoi,   'HOTEL', 'The Oberoi Grand, Kolkata',  13500.00, 16, 'AVAILABLE', '{"city":"Kolkata","stars":5,"amenities":"WiFi,Pool,Gym,Spa,Heritage","checkin":"14:00","checkout":"12:00","roomType":"Premier"}', NOW(), 'system');

-- ============================================================
-- 5. TRANSPORT (15 rows)
-- ============================================================
INSERT INTO inventories (partner_id, item_type, name, price, availability, status, details, created_at, created_by) VALUES
-- Outstation cabs (5)
(@ola_outstation, 'TRANSPORT', 'Outstation Sedan Mumbai-Pune',         3500.00, 20, 'AVAILABLE', '{"vehicle":"Sedan","capacity":4,"includes":"Driver+Fuel+Tolls","duration":"3.5 hours","luggage":"Yes"}', NOW(), 'system'),
(@ola_outstation, 'TRANSPORT', 'Outstation Sedan Delhi-Jaipur',        4500.00, 18, 'AVAILABLE', '{"vehicle":"Sedan","capacity":4,"includes":"Driver+Fuel+Tolls","duration":"5 hours","luggage":"Yes"}', NOW(), 'system'),
(@mmt,            'TRANSPORT', 'Outstation Sedan Bangalore-Mysore',    3200.00, 22, 'AVAILABLE', '{"vehicle":"Sedan","capacity":4,"includes":"Driver+Fuel+Tolls","duration":"3 hours","luggage":"Yes"}', NOW(), 'system'),
(@mmt,            'TRANSPORT', 'Outstation Sedan Chennai-Pondicherry', 2800.00, 25, 'AVAILABLE', '{"vehicle":"Sedan","capacity":4,"includes":"Driver+Fuel+Tolls","duration":"3 hours","luggage":"Yes"}', NOW(), 'system'),
(@ola_outstation, 'TRANSPORT', 'Outstation Sedan Mumbai-Lonavala',     2200.00, 20, 'AVAILABLE', '{"vehicle":"Sedan","capacity":4,"includes":"Driver+Fuel+Tolls","duration":"2 hours","luggage":"Yes"}', NOW(), 'system'),
-- Airport transfers (5)
(@uber, 'TRANSPORT', 'Airport Transfer Mumbai',     800.00, 25, 'AVAILABLE', '{"vehicle":"Sedan","capacity":4,"includes":"Pickup+Drop","duration":"45 min","luggage":"Yes"}', NOW(), 'system'),
(@uber, 'TRANSPORT', 'Airport Transfer Delhi',     1000.00, 24, 'AVAILABLE', '{"vehicle":"Sedan","capacity":4,"includes":"Pickup+Drop","duration":"50 min","luggage":"Yes"}', NOW(), 'system'),
(@uber, 'TRANSPORT', 'Airport Transfer Bangalore',  900.00, 22, 'AVAILABLE', '{"vehicle":"Sedan","capacity":4,"includes":"Pickup+Drop","duration":"60 min","luggage":"Yes"}', NOW(), 'system'),
(@mmt,  'TRANSPORT', 'Airport Transfer Chennai',    850.00, 18, 'AVAILABLE', '{"vehicle":"Sedan","capacity":4,"includes":"Pickup+Drop","duration":"50 min","luggage":"Yes"}', NOW(), 'system'),
(@mmt,  'TRANSPORT', 'Airport Transfer Hyderabad',  900.00, 20, 'AVAILABLE', '{"vehicle":"Sedan","capacity":4,"includes":"Pickup+Drop","duration":"55 min","luggage":"Yes"}', NOW(), 'system'),
-- Premium chauffeur (3)
(@uber, 'TRANSPORT', 'Premium Chauffeur Mumbai Full Day',    4500.00, 12, 'AVAILABLE', '{"vehicle":"Premium Sedan","capacity":4,"includes":"Chauffeur+Fuel+Water","duration":"8 hours / 80km","luggage":"Yes"}', NOW(), 'system'),
(@uber, 'TRANSPORT', 'Premium Chauffeur Delhi Full Day',     4500.00, 10, 'AVAILABLE', '{"vehicle":"Premium Sedan","capacity":4,"includes":"Chauffeur+Fuel+Water","duration":"8 hours / 80km","luggage":"Yes"}', NOW(), 'system'),
(@uber, 'TRANSPORT', 'Premium Chauffeur Bangalore Full Day', 4000.00, 14, 'AVAILABLE', '{"vehicle":"Premium Sedan","capacity":4,"includes":"Chauffeur+Fuel+Water","duration":"8 hours / 80km","luggage":"Yes"}', NOW(), 'system'),
-- City cabs (2)
(@uber, 'TRANSPORT', 'City Cab Hourly Mumbai',  350.00, 16, 'AVAILABLE', '{"vehicle":"Hatchback","capacity":4,"includes":"Driver+Fuel","duration":"1 hour","luggage":"Limited"}', NOW(), 'system'),
(@uber, 'TRANSPORT', 'City Cab Hourly Delhi',   350.00, 16, 'AVAILABLE', '{"vehicle":"Hatchback","capacity":4,"includes":"Driver+Fuel","duration":"1 hour","luggage":"Limited"}', NOW(), 'system');

-- Done
SELECT item_type, COUNT(*) AS cnt FROM inventories GROUP BY item_type;

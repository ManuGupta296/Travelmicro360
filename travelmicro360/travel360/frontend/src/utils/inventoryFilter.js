/**
 * Inventory filtering utilities for Travel360 search.
 */

export function parseDetails(inventory) {
  if (!inventory?.details) return null;
  if (typeof inventory.details === 'object') return inventory.details;
  try { return JSON.parse(inventory.details); }
  catch { return null; }
}

export function extractCodeAndCity(input) {
  if (!input || typeof input !== 'string') return { code: null, city: null };
  const m = input.match(/^(.+?)\s*\(([A-Z]{2,4})\)\s*$/);
  if (m) return { city: m[1].trim(), code: m[2].toUpperCase() };
  const v = input.trim();
  if (/^[A-Z]{2,4}$/i.test(v)) return { code: v.toUpperCase(), city: v };
  return { code: v.toUpperCase(), city: v };
}

export function matchInventory(inv, { type, from, to, maxPrice, minPrice }) {
  // Type match
  if (type && inv.itemType?.toUpperCase() !== type.toUpperCase()) return false;

  // Price range
  const price = Number(inv.price) || 0;
  if (minPrice != null && price < minPrice) return false;
  if (maxPrice != null && price > maxPrice) return false;

  // Must be available
  if (inv.status && inv.status !== 'AVAILABLE') return false;
  if (inv.availability != null && inv.availability <= 0) return false;

  const fromQ = extractCodeAndCity(from);
  const toQ = extractCodeAndCity(to);

  // If no location filter, accept all
  if (!fromQ.code && !fromQ.city && !toQ.code && !toQ.city) return true;

  // Helper: check if text contains any token from query
  const textContains = (text, q) => {
    if (!q.code && !q.city) return true;
    if (!text) return false;
    const lt = text.toLowerCase();
    if (q.code && lt.includes(q.code.toLowerCase())) return true;
    if (q.city && lt.includes(q.city.toLowerCase())) return true;
    return false;
  };

   const d = parseDetails(inv);
   const itype = inv.itemType?.toUpperCase();
   const nameStr = inv.name || '';

   if (itype === 'FLIGHT' || itype === 'TRAIN' || itype === 'BUS') {
     // Route types: match in name (e.g., "AI-101 Delhi → Mumbai", "Train: Mumbai → Pune (AC Chair Car)",
     // "Bus: Delhi → Jaipur (Volvo AC Seater)") or structured details.from/details.to.
     const fromOk = textContains(nameStr, fromQ) || (d && (textContains(d.from, fromQ) || textContains(d.fromCity, fromQ)));
     const toOk = textContains(nameStr, toQ) || (d && (textContains(d.to, toQ) || textContains(d.toCity, toQ)));
     return fromOk && toOk;
   }

  if (itype === 'HOTEL') {
    const cityQuery = fromQ.city ? fromQ : toQ;
    return textContains(nameStr, cityQuery) || (d && (textContains(d.city, cityQuery) || textContains(d.area, cityQuery)));
  }

  if (itype === 'TRANSPORT') {
    // Cabs/transport are local point-to-point services with no from/to route in details — show all regardless of route.
    return true;
  }

  return true;
}

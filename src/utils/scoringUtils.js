function jaccardSimilarity(arrA, arrB) {
  const a = new Set(arrA || []);
  const b = new Set(arrB || []);
  if (a.size === 0 && b.size === 0) return 0;
  let intersection = 0;
  for (const x of a) if (b.has(x)) intersection++;
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function priceSimilarity(priceA, priceB) {
  const a = parseFloat(priceA);
  const b = parseFloat(priceB);
  if (isNaN(a) || isNaN(b)) return 0;
  return 1 - Math.abs(a - b) / 4;
}

function amenitySimilarity(amenitiesJsonA, amenitiesJsonB) {
  let objA = {};
  let objB = {};
  try { objA = JSON.parse(amenitiesJsonA || '{}'); } catch { /* empty */ }
  try { objB = JSON.parse(amenitiesJsonB || '{}'); } catch { /* empty */ }

  // Jaccard on sets of amenity keys that are true
  const trueA = new Set(Object.keys(objA).filter(k => objA[k] === true));
  const trueB = new Set(Object.keys(objB).filter(k => objB[k] === true));
  if (trueA.size === 0 && trueB.size === 0) return 0;
  let intersection = 0;
  for (const k of trueA) if (trueB.has(k)) intersection++;
  const union = trueA.size + trueB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function locationSimilarity(a, b) {
  return a.district && b.district && a.district === b.district ? 1 : 0;
}

export function computeSimilarityScore(reference, candidate) {
  const cuisine = jaccardSimilarity(reference.cuisine_all, candidate.cuisine_all);
  const price = priceSimilarity(reference.price_range, candidate.price_range);
  const occasion = jaccardSimilarity(reference.purpose_tags, candidate.purpose_tags);
  const location = locationSimilarity(reference, candidate);
  const amenity = amenitySimilarity(reference.amenities, candidate.amenities);

  return (
    2.5 * cuisine +
    2.0 * price +
    2.0 * occasion +
    1.5 * location +
    1.0 * amenity
  );
}

export function getRelatedRestaurants(reference, allRestaurants, { hardRule, topN = 10 } = {}) {
  return allRestaurants
    .filter(r => r.handle !== reference.handle && (!hardRule || hardRule(r)))
    .map(r => ({ restaurant: r, score: computeSimilarityScore(reference, r) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map(({ restaurant }) => restaurant);
}

// weightedRefs: Array of { restaurant, weight }
export function getPersonalizedRecommendations(weightedRefs, allRestaurants, { topN = 12 } = {}) {
  const refHandles = new Set(weightedRefs.map(({ restaurant }) => restaurant.handle));
  const totalWeight = weightedRefs.reduce((sum, { weight }) => sum + weight, 0);
  return allRestaurants
    .filter(r => !refHandles.has(r.handle))
    .map(r => {
      const score = weightedRefs.reduce(
        (sum, { restaurant: ref, weight }) => sum + weight * computeSimilarityScore(ref, r),
        0,
      ) / totalWeight;
      return { restaurant: r, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map(({ restaurant }) => restaurant);
}

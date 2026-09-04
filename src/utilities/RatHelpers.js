import { INV_KEYS, RAT_IDENTIFIER, RAT_SEX_TAG, RAT_HEALTH_TAG } from "./constants.js"
import { getItemTag, extractItemFields, getCustomNameTag, findParentIndex } from "./ItemHelpers.js"

function isRatAlive(item) {
  const health = getItemTag(item, RAT_HEALTH_TAG);
  return health != null && health !== 0;
}

function deriveGeneFields(item, geneFields) {
  const derived = {};
  for (const gene of geneFields) {
    derived[gene.key] = getItemTag(item, gene.tag);
    const a = getItemTag(item, gene.tagA);
    const b = getItemTag(item, gene.tagB);
    derived[`${gene.key}Lower`] = Math.min(a, b);
    derived[`${gene.key}Higher`] = Math.max(a, b);
  }
  return derived;
}

function getParentDisplayName(items, itemIndex) {
  const parentIdx = findParentIndex(items, itemIndex);
  if (parentIdx === -1) return null;
  const parent = items[parentIdx];
  return getCustomNameTag(parent) || parent.name;
}

function collectRats(saveData, fields, geneFields) {
  const male = [];
  const female = [];

  for (const invKey of INV_KEYS) {
    const items = saveData.inventories[invKey]?.saveItems || [];
    items.forEach((item, index) => {
      if (item.identifier !== RAT_IDENTIFIER) return;
      if (!isRatAlive(item)) return;

      const record = {
        ...extractItemFields(item, fields),
        ...deriveGeneFields(item, geneFields),
        parentItem: getParentDisplayName(items, index),
      };
      const target = getItemTag(item, RAT_SEX_TAG) === "MALE" ? male : female;
      target.push(record);
    });
  }

  return { male, female };
}

function classifyTier(value, groupValues) {
  const min = Math.min(...groupValues);
  const max = Math.max(...groupValues);
  const average = groupValues.reduce((sum, v) => sum + v, 0) / groupValues.length;

  if (value === min) return "minimum";
  if (value === max) return "maximum";
  if (value === average) return "average";
  return value < average ? "belowAverage" : "aboveAverage";
}

// A gene stat's single tier-value set is shared across all three of its
// underlying record fields (base, lower, higher) - each is classified
// against its own group distribution, and the resulting points are summed.
// A simple stat (e.g. age) is just its own single field.
function recordFieldsForStat(statKey, geneKeys) {
  return geneKeys.has(statKey) ? [statKey, `${statKey}Lower`, `${statKey}Higher`] : [statKey];
}

function scoreGroup(group, scoreFields, geneFields = []) {
  const geneKeys = new Set(geneFields.map(gene => gene.key));
  const statKeys = Object.keys(scoreFields);

  const fieldsByStat = {};
  const groupValuesByField = {};
  for (const statKey of statKeys) {
    const recordFields = recordFieldsForStat(statKey, geneKeys);
    fieldsByStat[statKey] = recordFields;
    for (const field of recordFields) {
      groupValuesByField[field] = group.map(rat => rat[field]);
    }
  }

  return group.map(rat => {
    const tiers = {};
    let totalScore = 0;
    for (const statKey of statKeys) {
      for (const field of fieldsByStat[statKey]) {
        const tier = classifyTier(rat[field], groupValuesByField[field]);
        tiers[field] = tier;
        totalScore += scoreFields[statKey][tier];
      }
    }
    return { ...rat, tiers, totalScore };
  });
}

function collectAndScoreRats(saveData, fields, geneFields, scoreFields) {
  const { male, female } = collectRats(saveData, fields, geneFields);
  return {
    male: scoreGroup(male, scoreFields, geneFields),
    female: scoreGroup(female, scoreFields, geneFields),
  };
}

// view: { sexFilter, parentFilter, valueFilterKey, valueFilterMin, valueFilterMax, sortKey, sortDir }
// sexFilter: "ALL"|"MALE"|"FEMALE". parentFilter is an array of parentItem
// names to allow through (empty/undefined = no filtering). valueFilterKey
// selects which numeric record field the min/max range applies to (either
// bound can be left ""). sortDir: "asc"|"desc".
function sortAndFilterRats(rats, view) {
  let list = rats;

  if (view.sexFilter && view.sexFilter !== "ALL") {
    list = list.filter(rat => rat.sex === view.sexFilter);
  }

  if (view.parentFilter && view.parentFilter.length) {
    const allowedParents = new Set(view.parentFilter);
    list = list.filter(rat => allowedParents.has(rat.parentItem));
  }

  if (view.valueFilterKey) {
    const min = view.valueFilterMin === "" || view.valueFilterMin == null ? -Infinity : Number(view.valueFilterMin);
    const max = view.valueFilterMax === "" || view.valueFilterMax == null ? Infinity : Number(view.valueFilterMax);
    list = list.filter(rat => {
      const value = rat[view.valueFilterKey];
      return typeof value === "number" && value >= min && value <= max;
    });
  }

  if (view.sortKey) {
    const direction = view.sortDir === "desc" ? -1 : 1;
    list = [...list].sort((a, b) => {
      const av = a[view.sortKey];
      const bv = b[view.sortKey];
      if (av === bv) return 0;
      return av < bv ? -direction : direction;
    });
  }

  return list;
}

// recommendationFields must be sorted descending by threshold, with a single
// `threshold: null` entry as the catch-all - see the contract comment next
// to RAT_RECOMMENDATION_FIELDS in constants.js.
function getRecommendation(score, recommendationFields) {
  return recommendationFields.find(r => r.threshold == null || score >= r.threshold) || null;
}

export { collectRats, deriveGeneFields, classifyTier, scoreGroup, collectAndScoreRats, sortAndFilterRats, getRecommendation };

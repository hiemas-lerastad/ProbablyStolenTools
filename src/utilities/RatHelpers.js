import { getCustomNameTag } from "./ItemHelpers.js"

const ANIMAL_SPECIES_TAG = "ANIMAL_SPECIES_TAG";
const RAT_SPECIES_VALUE = "ANIMAL_RAT";

const GENE_TAGS = {
  growthRate: "ANIMAL_GROWTH_RATE_TAG",
  expectedLitter: "ANIMAL_LITTER_SIZE_TAG",
  immunity: "ANIMAL_IMMUNITY_TAG",
  maxHealth: "ANIMAL_MAX_HEALTH_TAG",
  longevity: "ANIMAL_LONGEVITY_TAG",
  hungerRate: "ANIMAL_HUNGER_RATE_TAG",
};

function getTag(item, identifier) {
  const idx = item._keys.indexOf(identifier);
  return idx === -1 ? null : item._values[idx];
}

function getTagFloat(item, identifier) {
  const tag = getTag(item, identifier);
  return tag ? tag.valueFloat : null;
}

function isRatItem(item) {
  const tag = getTag(item, ANIMAL_SPECIES_TAG);
  return !!tag && tag.internalValueString === RAT_SPECIES_VALUE;
}

function buildRatFromItem(item) {
  const rat = { name: getCustomNameTag(item) || item.name || "Rat" };

  for (const [prop, tag] of Object.entries(GENE_TAGS)) {
    const value = getTagFloat(item, tag);
    const alleleA = getTagFloat(item, `${tag}_ALLELE_A`);
    const alleleB = getTagFloat(item, `${tag}_ALLELE_B`);

    rat[prop] = alleleA >= alleleB
      ? { value, highest: alleleA, lowest: alleleB }
      : { value, highest: alleleB, lowest: alleleA };
  }

  return rat;
}

function extractRatsFromSave(saveData) {
  const rats = [];
  for (const inv of Object.values(saveData.inventories || {})) {
    for (const item of inv.saveItems || []) {
      if (isRatItem(item)) rats.push(buildRatFromItem(item));
    }
  }
  return rats;
}

export { extractRatsFromSave };

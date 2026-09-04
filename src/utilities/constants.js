import { getTagValue, addItemTag, removeItemTag } from "./ItemHelpers.js"

const INV_KEYS = [
  "mainInvJSON",
  "backInvJSON",
  "trashcanInvJSON",
  "docInvJSON",
  "cassettePlayerInvJSON",
  "showcaseInvJSON",
  "hirelingInvJSON",
  "hiddenInvJSON",
  "vendingMachineInvJSON",
  "vendingFountainInvJSON",
];

const INV_LABELS = {
  mainInvJSON: "Main (bag)",
  backInvJSON: "Back",
  trashcanInvJSON: "Trashcan",
  docInvJSON: "Dossier",
  cassettePlayerInvJSON: "Cassette player",
  showcaseInvJSON: "Display Case",
  hirelingInvJSON: "Hireling",
  hiddenInvJSON: "Hidden",
  vendingMachineInvJSON: "Vending machine",
  vendingFountainInvJSON: "Vending fountain",
};

const PLAYER_STORE_NESTED_FIELDS = [
  "storeReputations",
  "healthData",
  "secData",
  "savedItemFeatureList",
  "storeClientManager",
  "startingPerks"
];

const VALID_ESCAPE_CHARS = new Set(["\"", "\\", "/", "b", "f", "n", "r", "t", "u"]);

// Schema node contract:
//   leaf:   { key, type: "number"|"text"|"checkbox", path?, label? }
//   object: { key, type: "object", path?, fields: [node, ...] }
//   array:  { key, type: "array", path?, mutable?,
//             itemSchema: [node, ...] | itemType: "number"|"text"|"checkbox",
//             titleField?, titleFn?, defaultItem: () => item }
//   dict:   { key, type: "dict", path?, itemType?, mutable?,
//             entries?: (raw) => [[name, rawValue], ...],
//             getValue?: (rawValue) => scalar,
//             setValue?: (raw, name, scalar) => newRaw,
//             addEntry?: (raw, name) => newRaw,
//             removeEntry?: (raw, name) => newRaw }
// `path` is the list of keys from the nearest enclosing scope (saveData for a
// top-level schema, or an array item for entries inside that array's itemSchema)
// down to the object that directly holds `key`. Omitting it means `key` sits
// directly on the enclosing scope.
// A dict node's `path` points straight at the container the entries live on -
// unlike other nodes, `key` is never appended to it, since it's only used as
// this node's identity/label. The five accessors default to treating that
// container as a plain `{ name: value }` object; override them when it isn't
// (e.g. a name/value pair spread across two parallel arrays with a
// polymorphic per-entry value encoding, like item tags).

const PLAYER_SCHEMA = [
  { key: "playerCash", type: "number", path: ["playerStore"] },
  { key: "wildFavor", type: "number", path: ["playerStore"] },
  { key: "evidenceLevel", type: "number", path: ["playerStore", "secData"] },
  { key: "daysSinceNicotineConsumption", type: "number", path: ["playerStore", "healthData"] },
  { key: "daysSinceAlcoholConsumption", type: "number", path: ["playerStore", "healthData"] },
  { key: "daysSinceNarcoticConsumption", type: "number", path: ["playerStore", "healthData"] },
  { key: "daysSinceSentinelInjection", type: "number", path: ["playerStore", "healthData"] },
  { key: "sentinelPool", type: "number", path: ["playerStore", "healthData"] },
  { key: "woundState", type: "number", path: ["playerStore", "healthData"] },
  { key: "isWoundStable", type: "checkbox", path: ["playerStore", "healthData"] },
  { key: "isWoundedFresh", type: "checkbox", path: ["playerStore", "healthData"] },
  { key: "wentToAfterhoursLastNight", type: "checkbox", path: ["playerStore", "healthData"] },
];

const STORE_SCHEMA = [
  { key: "IsPropertyPaid", type: "checkbox", path: ["playerStore"] },
  { key: "baseStoreAttractiveness", type: "number", path: ["playerStore"] },
  { key: "todayGutterflowPurity", type: "number", path: ["storeStation"] },
  { key: "todayRustwaterPurity", type: "number", path: ["storeStation"] },
  { key: "isHardMode", type: "checkbox", path: ["playerStore"] },
  { key: "endlessMode", type: "checkbox", path: ["playerStore"] },
  { key: "skipIntro", type: "checkbox", path: ["playerStore"] },
];

const STARTING_PERK_FIELDS = [
  { key: "id", type: "text" },
  { key: "cost", type: "number" },
  { key: "type", type: "number" },
  { key: "maxSlot", type: "number" },
  { key: "incompatiblePerks", type: "array", itemType: "text" },
];

const STARTING_PERKS_SCHEMA = {
  key: "startingPerks",
  type: "array",
  path: ["playerStore"],
  itemSchema: STARTING_PERK_FIELDS,
  titleField: "id",
  defaultItem: () => ({ id: "", cost: 0, type: 0, maxSlot: 0, incompatiblePerks: [] }),
};

const REPUTATION_FIELDS = [
  { key: "amount", type: "number" },
  { key: "strength", type: "number" },
  { key: "influence", type: "number" },
  { key: "actionCooldown", type: "number" },
  { key: "currentReportPenalty", type: "number" },
  { key: "repLossMultiplier", type: "number" },
  { key: "canVandalized", type: "checkbox" },
];

const REPUTATION_PERK_FIELDS = [
  { key: "perkThreshold", type: "number" },
  { key: "perkType", type: "number" },
  { key: "isUnlocked", type: "checkbox" },
  { key: "isAlwaysActive", type: "checkbox" },
];

const ITEM_DETAILS_SCHEMA = [
  { key: "identifier", type: "text" },
  { key: "name", type: "text" },
  { key: "shortDescription", type: "text" },
  { key: "flavorText", type: "text" },
  { key: "unitCount", type: "number" },
  { key: "unitBaseValue", type: "number" },
  { key: "unitValue", type: "number" },
  { key: "lateUnitValue", type: "number" },
  { key: "backupUnitValue", type: "number" },
  { key: "itemType", type: "text" },
  { key: "spriteAtlasPath", type: "text" },
  { key: "spritePath", type: "text" },
];

const ITEM_POSITION_SCHEMA = [
  { key: "<minX>k__BackingField", type: "number", path: ["itemModifiedShape"], label: "x" },
  { key: "<minY>k__BackingField", type: "number", path: ["itemModifiedShape"], label: "y" },
];

const ITEM_TAGS_SCHEMA = {
  key: "tags",
  type: "dict",
  itemType: "text",
  entries: (item) => item._keys.map((name, i) => [name, item._values[i]]),
  getValue: (tag) => getTagValue(tag),
  setValue: (item, name, value) => addItemTag(item, name, value),
  addEntry: (item, name) => addItemTag(item, name, ""),
  removeEntry: (item, name) => removeItemTag(item, name),
};

const STORE_REPUTATIONS_SCHEMA = {
  key: "storeReputations",
  type: "array",
  path: ["playerStore"],
  titleField: "factionDisplay",
  mutable: false,
  itemSchema: [
    ...REPUTATION_FIELDS,
    {
      key: "perks",
      type: "array",
      itemSchema: REPUTATION_PERK_FIELDS,
      titleField: "perkId",
      mutable: false,
      defaultItem: () => ({ perkThreshold: 0, perkType: 0, isUnlocked: false, isAlwaysActive: false }),
    },
  ],
};

const ITEM_FEATURE_LIST_CONDITION_FIELDS = [
  { key: "display", type: "text" },
  { key: "identifier", type: "text" },
  { key: "modValue", type: "number" },
  { key: "modValueDisplay", type: "number" },
  { key: "isTransformative", type: "checkbox" },
  { key: "category", type: "text" },
  { key: "hiddenAsPublic", type: "checkbox" },
  { key: "customValue", type: "number" },
  { key: "onActivateActionId", type: "text" },
  { key: "compareValue", type: "number" },
]

const ITEM_FEATURE_LIST_FIELDS = [
  { key: "featureType", type: "number" },
  { key: "valueStage", type: "number" },
  { key: "parentItemUniqueId", type: "number" },
  { key: "publicDisplay", type: "text" },
  { key: "actualDisplay", type: "text" },
  // { key: "removedByTool", type: "text" },
  { key: "valueModifier", type: "number" },
  { key: "initiallyShown", type: "checkbox" },
  { key: "isFeatureExposed", type: "checkbox" },
  { key: "isExposing", type: "checkbox" },
  { key: "isFeatureDiscovered", type: "checkbox" },
  { key: "useCondition", type: "checkbox" },
  { key: "usePreExposeValue", type: "checkbox" },
  { key: "preExposeValueModifier", type: "number" },
  { key: "isExposable", type: "checkbox" },
  { key: "isPublicHidden", type: "checkbox" },
  { key: "customIntValue1", type: "number" },
  { key: "isDisabled", type: "checkbox" },
  { key: "identifier", type: "text" },
  { key: "category", type: "text" },
  { key: "isFeatureMatch", type: "checkbox" },
  {
    key: "realCondition",
    type: "object",
    fields: ITEM_FEATURE_LIST_CONDITION_FIELDS
  },
  {
    key: "fakeCondition",
    type: "object",
    fields: ITEM_FEATURE_LIST_CONDITION_FIELDS
  },
];

const ITEM_FEATURE_LIST_SCHEMA = {
  key: "savedItemFeatureList",
  type: "array",
  path: ["playerStore"],
  itemSchema: ITEM_FEATURE_LIST_FIELDS,
  titleField: "publicDisplay",
  defaultItem: () => ({ id: "", cost: 0, type: 0, maxSlot: 0, incompatiblePerks: [] }),
};

const CLIENT_MANAGER_PATH = ["playerStore", "storeClientManager"];

const CLIENT_MANAGER_SCHEMA = [
  { key: "daySinceInformationClient", type: "number", path: CLIENT_MANAGER_PATH },
  { key: "daySinceInspection", type: "number", path: CLIENT_MANAGER_PATH },
  { key: "daySinceWantedWasQueued", type: "number", path: CLIENT_MANAGER_PATH },
  { key: "dayUntilInspection", type: "number", path: CLIENT_MANAGER_PATH },
  { key: "inspectionSeeded", type: "checkbox", path: CLIENT_MANAGER_PATH },
  { key: "isAugSpawnHandledToday", type: "checkbox", path: CLIENT_MANAGER_PATH },
  { key: "isTodayWantedQueued", type: "checkbox", path: CLIENT_MANAGER_PATH },
  { key: "wildBailoutGiven", type: "checkbox", path: CLIENT_MANAGER_PATH },
  { key: "arrestedClients", type: "array", itemType: "text", path: CLIENT_MANAGER_PATH },
  { key: "wealthHistory", type: "array", itemType: "text", path: CLIENT_MANAGER_PATH },
  { key: "clientTracker", type: "dict", path: [...CLIENT_MANAGER_PATH, "clientTracker"], itemType: "number", mutable: false },
  { key: "permanentClientTracker", type: "dict", path: [...CLIENT_MANAGER_PATH, "permanentClientTracker"], itemType: "number", mutable: false },
];

const RAT_IDENTIFIER = "rat";
const RAT_SEX_TAG = "ANIMAL_SEXE_TAG";
const RAT_HEALTH_TAG = "ANIMAL_HEALTH_TAG";

// Field-mapping contract (extractItemFields in ItemHelpers.js):
//   { key, source: "field"|"tag", name }
// `key` is the property name in the exported record; `name` is either a
// direct property on the item (source: "field") or an item tag identifier
// (source: "tag"), read the same way EditableField/dict tags are.
const RAT_EXPORT_FIELDS = [
  { key: "uniqueId", source: "field", name: "uniqueId" },
  { key: "name", source: "field", name: "name" },
  { key: "sex", source: "tag", name: RAT_SEX_TAG },
  { key: "age", source: "tag", name: "ANIMAL_AGE_TAG" },
  { key: "customName", source: "tag", name: "CUSTOM_NAME_TAG" },
  { key: "diseased", source: "tag", name: "ANIMAL_DISEASED_TAG" },
  { key: "health", source: "tag", name: "ANIMAL_HEALTH_TAG" },
  { key: "hunger", source: "tag", name: "ANIMAL_HUNGER_TAG" },
  { key: "maxHunger", source: "tag", name: "ANIMAL_MAX_HUNGER_TAG" },
  // maxHealth is not listed here - RAT_GENE_FIELDS' "maxHealth" gene already
  // reads this same tag (plus its alleles) and produces rat.maxHealth.
];

// Gene contract (deriveGeneFields in RatHelpers.js):
//   { key, tag, tagA, tagB }
// Each gene has three related tags: the base/phenotype tag itself, plus two
// alleles that aren't ordered (A isn't always the "lower" one). One entry
// derives three record fields: `key` (the base tag's value, as-is),
// `${key}Lower` = min(A, B), `${key}Higher` = max(A, B).
const RAT_GENE_FIELDS = [
  { key: "growthRate", tag: "ANIMAL_GROWTH_RATE_TAG", tagA: "ANIMAL_GROWTH_RATE_TAG_ALLELE_A", tagB: "ANIMAL_GROWTH_RATE_TAG_ALLELE_B" },
  { key: "litterSize", tag: "ANIMAL_LITTER_SIZE_TAG", tagA: "ANIMAL_LITTER_SIZE_TAG_ALLELE_A", tagB: "ANIMAL_LITTER_SIZE_TAG_ALLELE_B" },
  { key: "immunity", tag: "ANIMAL_IMMUNITY_TAG", tagA: "ANIMAL_IMMUNITY_TAG_ALLELE_A", tagB: "ANIMAL_IMMUNITY_TAG_ALLELE_B" },
  { key: "maxHealth", tag: "ANIMAL_MAX_HEALTH_TAG", tagA: "ANIMAL_MAX_HEALTH_TAG_ALLELE_A", tagB: "ANIMAL_MAX_HEALTH_TAG_ALLELE_B" },
  { key: "longevity", tag: "ANIMAL_LONGEVITY_TAG", tagA: "ANIMAL_LONGEVITY_TAG_ALLELE_A", tagB: "ANIMAL_LONGEVITY_TAG_ALLELE_B" },
  { key: "hungerRate", tag: "ANIMAL_HUNGER_RATE_TAG", tagA: "ANIMAL_HUNGER_RATE_TAG_ALLELE_A", tagB: "ANIMAL_HUNGER_RATE_TAG_ALLELE_B" },
];

// Score-tier contract (scoreGroup in RatHelpers.js):
//   { [statKey]: { minimum, belowAverage, average, aboveAverage, maximum } }
// `statKey` must be a key present on the extracted/derived rat record (from
// RAT_EXPORT_FIELDS or RAT_GENE_FIELDS). Each stat's 5 tier values are
// independent and user-editable; they're the point value awarded to a rat
// whose value for that stat falls into that tier, relative to its own sex
// group. These are just the starting defaults - live edits are held as
// state in RatDataContext, not here. Built from RAT_GENE_FIELDS so every
// gene gets one combined entry - add a gene there and it appears here with
// no further changes needed. A gene's single tier-value set is applied to
// all three of its underlying values (base, lower, higher) and summed - see
// scoreGroup in RatHelpers.js.
const DEFAULT_TIER_VALUES = { minimum: -2, belowAverage: -1, average: 0, aboveAverage: 1, maximum: 2 };

const RAT_SCORE_FIELDS = {
  ...Object.fromEntries(RAT_GENE_FIELDS.map(({ key }) => [key, { ...DEFAULT_TIER_VALUES }])),
};

// Sortable/filterable field contract: { key, label, numeric? }
// `key` must exist on the combined rat record (RAT_EXPORT_FIELDS,
// RAT_GENE_FIELDS's base/Lower/Higher trio, or "totalScore"). `numeric`
// marks fields usable in the value-range filter (as opposed to sex/name,
// which are matched exactly / by substring instead).
const RAT_SORT_FIELDS = [
  { key: "name", label: "Name" },
  { key: "sex", label: "Sex" },
  { key: "age", label: "Age", numeric: true },
  { key: "totalScore", label: "Score", numeric: true },
  ...RAT_GENE_FIELDS.flatMap(({ key, label = key }) => [
    { key, label, numeric: true },
    { key: `${key}Lower`, label: `${label} (lower)`, numeric: true },
    { key: `${key}Higher`, label: `${label} (higher)`, numeric: true },
  ]),
];

// Recommendation contract (getRecommendation in RatHelpers.js):
//   { tier, threshold, label }[]
// Ordered highest threshold first; a rat's totalScore is matched against the
// first entry whose threshold it meets or exceeds, so this array must stay
// sorted descending by threshold for the cascade to work. `threshold: null`
// marks the catch-all (lowest) tier. `tier` reuses the same five score-tier
// names as RAT_SCORE_FIELDS, so the label gets the same rat-tier-* CSS class
// as the stat it's judging. These are just the starting defaults - live
// edits are held as state in RatDataContext, not here.
const RAT_RECOMMENDATION_FIELDS = [
  { tier: "maximum", threshold: 8, label: "Good Candidate for Breeding" },
  { tier: "aboveAverage", threshold: 2, label: "Overall Positive" },
  { tier: "average", threshold: -2, label: "Investigate" },
  { tier: "belowAverage", threshold: -8, label: "Overall Negative" },
  { tier: "minimum", threshold: null, label: "Good Candidate for Neutering" },
];

export {
  INV_KEYS,
  INV_LABELS,
  PLAYER_STORE_NESTED_FIELDS,

  VALID_ESCAPE_CHARS,

  PLAYER_SCHEMA,
  STORE_SCHEMA,
  STARTING_PERK_FIELDS,
  STARTING_PERKS_SCHEMA,
  REPUTATION_FIELDS,
  REPUTATION_PERK_FIELDS,
  STORE_REPUTATIONS_SCHEMA,
  ITEM_DETAILS_SCHEMA,
  ITEM_POSITION_SCHEMA,
  ITEM_TAGS_SCHEMA,
  ITEM_FEATURE_LIST_SCHEMA,
  CLIENT_MANAGER_SCHEMA,

  RAT_IDENTIFIER,
  RAT_SEX_TAG,
  RAT_HEALTH_TAG,
  RAT_EXPORT_FIELDS,
  RAT_GENE_FIELDS,
  RAT_SCORE_FIELDS,
  RAT_SORT_FIELDS,
  RAT_RECOMMENDATION_FIELDS,
}

const INV_KEYS = [
  "mainInvJSON", "backInvJSON", "trashcanInvJSON", "docInvJSON",
  "cassettePlayerInvJSON", "showcaseInvJSON", "hirelingInvJSON",
  "hiddenInvJSON", "vendingMachineInvJSON", "vendingFountainInvJSON",
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

const REQUIRED_ITEM_FIELDS = [
  "identifier", "unitCount", "itemShape", "itemModifiedShape", "itemType", "name",
  "shortDescription", "flavorText", "unitBaseValue", "unitValue", "lateUnitValue",
  "backupUnitValue", "spriteAtlasPath", "spritePath", "itemTypes",
];

const EDITABLE_FIELDS = [
  ["identifier", "text"], ["name", "text"], ["shortDescription", "text"], ["flavorText", "text"],
  ["unitCount", "number"], ["unitBaseValue", "number"], ["unitValue", "number"],
  ["lateUnitValue", "number"], ["backupUnitValue", "number"],
  ["itemType", "text"], ["spriteAtlasPath", "text"], ["spritePath", "text"],
];

const PLAYER_FIELDS = [
  ["playerCash", "number", "playerStore"],
  ["wildFavor", "number", "playerStore"],
  ["evidenceLevel", "number", "playerStore", "secData"],
  ["daysSinceNicotineConsumption", "number", "playerStore", "healthData"],
  ["daysSinceAlcoholConsumption", "number", "playerStore", "healthData"],
  ["daysSinceNarcoticConsumption", "number", "playerStore", "healthData"],
  ["daysSinceSentinelInjection", "number", "playerStore", "healthData"],
  ["sentinelPool", "number", "playerStore", "healthData"],
  ["woundState", "number", "playerStore", "healthData"],
  ["isWoundStable", "checkbox", "playerStore", "healthData"],
  ["isWoundedFresh", "checkbox", "playerStore", "healthData"],
  ["wentToAfterhoursLastNight", "checkbox", "playerStore", "healthData"],
];

const STORE_FIELDS = [
  ["IsPropertyPaid", "checkbox", "playerStore"],
  ["baseStoreAttractiveness", "number", "playerStore"],
  ["todayGutterflowPurity", "number", "storeStation"],
  ["todayRustwaterPurity", "number", "storeStation"],
  ["isHardMode", "checkbox", "playerStore"],
  ["endlessMode", "checkbox", "playerStore"],
  ["skipIntro", "checkbox", "playerStore"],
];

const REPUTATION_FIELDS = [
  ["amount", "number"], ["strength", "number"], ["influence", "number"],
  ["actionCooldown", "number"], ["currentReportPenalty", "number"], ["repLossMultiplier", "number"],
  ["canVandalized", "checkbox"],
];

const PERK_FIELDS = [
  ["perkThreshold", "number"], ["perkType", "number"],
  ["isUnlocked", "checkbox"], ["isAlwaysActive", "checkbox"],
];

const STORE_CLIENT_MANAGER_FIELDS = [
  ["isTodayWantedQueued", "checkbox"], ["daySinceWantedWasQueued", "number"],
  ["isAugSpawnHandledToday", "checkbox"], ["daySinceInformationClient", "number"],
  ["daySinceInspection", "number"], ["dayUntilInspection", "number"],
  ["inspectionSeeded", "checkbox"], ["wildBailoutGiven", "checkbox"],
];

const STORE_CLIENT_MANAGER_RAW_FIELDS = [
  "clientTracker", "permanentClientTracker", "uniqueClientTracker",
  "arrestedClients", "possibleRandomWantedClient", "wealthHistory",
];

const FEATURE_FIELDS = [
  ["featureType", "number"], ["valueStage", "number"], ["parentItemUniqueId", "number"],
  ["publicDisplay", "text"], ["actualDisplay", "text"], ["removedByTool", "text"],
  ["valueModifier", "number"], ["initiallyShown", "checkbox"], ["isFeatureExposed", "checkbox"],
  ["isExposing", "checkbox"], ["isFeatureDiscovered", "checkbox"], ["useCondition", "checkbox"],
  ["usePreExposeValue", "checkbox"], ["preExposeValueModifier", "number"], ["isExposable", "checkbox"],
  ["isPublicHidden", "checkbox"], ["customIntValue1", "number"], ["isDisabled", "checkbox"],
  ["identifier", "text"], ["category", "text"], ["isFeatureMatch", "checkbox"],
];

const FEATURE_CONDITION_FIELDS = [
  ["display", "text"], ["identifier", "text"], ["modValue", "number"], ["modValueDisplay", "number"],
  ["isTransformative", "checkbox"], ["category", "text"], ["hiddenAsPublic", "checkbox"],
  ["customValue", "number"], ["onActivateActionId", "text"], ["compareValue", "number"],
];

const POSITION_FIELDS = [
  ["x", "<minX>k__BackingField"],
  ["y", "<minY>k__BackingField"],
];

const ADVANCED_FIELDS = [

];

export {
  INV_KEYS,
  INV_LABELS,
  REQUIRED_ITEM_FIELDS,
  EDITABLE_FIELDS,
  PLAYER_FIELDS,
  STORE_FIELDS,
  ADVANCED_FIELDS,
  REPUTATION_FIELDS,
  PERK_FIELDS,
  FEATURE_FIELDS,
  FEATURE_CONDITION_FIELDS,
  STORE_CLIENT_MANAGER_FIELDS,
  STORE_CLIENT_MANAGER_RAW_FIELDS,
  POSITION_FIELDS
};
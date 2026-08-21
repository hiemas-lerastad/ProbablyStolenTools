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

const PLAYER_STORE_FIELDS = [
  ["playerCash", "number"],
  ["wildFavor", "number"],
  ["IsPropertyPaid", "checkbox"]
];

export {
  INV_KEYS,
  INV_LABELS,
  REQUIRED_ITEM_FIELDS,
  EDITABLE_FIELDS,
  PLAYER_STORE_FIELDS
};
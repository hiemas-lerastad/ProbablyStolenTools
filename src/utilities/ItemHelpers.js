import { REQUIRED_ITEM_FIELDS } from "../constants.js"

function getTagValue(tag) {
  return tag.valueBool || tag.valueLong || tag.valueDouble || tag.valueInt || tag.valueFloat || tag.internalValueString || null;
}

function getCustomNameTag(item) {
  const idx = item._keys.indexOf("CUSTOM_NAME_TAG");
  if (idx === -1) return null;
  return getTagValue(item._values[idx]);
}

function setTagValueFromInput(tag, str) {
  str = str.trim();
  tag.valueBool = false;
  tag.valueInt = 0;
  tag.valueLong = 0;
  tag.valueFloat = 0;
  tag.valueDouble = 0;
  tag.internalValueString = "";
  if (str === "" || str.toLowerCase() === "none" || str.toLowerCase() === "null") return;
  if (str.toLowerCase() === "true") { tag.valueBool = true; return; }
  if (str.toLowerCase() === "false") { tag.valueBool = false; return; }
  if (/^-?\d+$/.test(str)) {
    const n = parseInt(str, 10);
    tag.valueInt = n;
    tag.valueLong = n;
    return;
  }
  const f = parseFloat(str);
  if (!Number.isNaN(f)) {
    tag.valueFloat = f;
    tag.valueDouble = f;
    return;
  }
  tag.internalValueString = str;
}

function makeTag(identifier, valueStr) {
  const tag = {
    "<identifier>k__BackingField": identifier,
    "<identifierName>k__BackingField": `TYPE-STRING_${identifier}`,
    valueEnabled: true,
    internalValueString: "",
    valueInt: 0,
    valueFloat: 0,
    valueLong: 0,
    valueDouble: 0,
    valueBool: false,
  };
  setTagValueFromInput(tag, valueStr);
  return tag;
}

function addItemTag(item, identifier, valueStr) {
  const idx = item._keys.indexOf(identifier);

  if (idx !== -1) {
    const newValues = item._values.map((v, i) => i === idx ? { ...v } : v);
    setTagValueFromInput(newValues[idx], valueStr);
    return { ...item, _values: newValues };
  }

  return {
    ...item,
    _keys: [...item._keys, identifier],
    _values: [...item._values, makeTag(identifier, valueStr)],
  };
}

function removeItemTag(item, identifier) {
  const idx = item._keys.indexOf(identifier);
  if (idx === -1) return item;

  return {
    ...item,
    _keys: item._keys.filter((_, i) => i !== idx),
    _values: item._values.filter((_, i) => i !== idx),
  };
}

function findParentIndex(saveItems, itemIdx) {
  return saveItems.findIndex(it => Array.isArray(it.childItems) && it.childItems.includes(itemIdx));
}

function parseRawItem(rawJson) {
  const item = JSON.parse(rawJson);
  for (const f of REQUIRED_ITEM_FIELDS) {
    if (!(f in item)) throw new Error(`Missing required field "${f}"`);
  }
  return item;
}

function buildNewSaveItem(item, newIdx, newUniqueId) {
  return {
    ...item,
    _keys: item._keys || [],
    _values: item._values || [],
    uuid: newIdx,
    uniqueId: newUniqueId,
    childItems: [],
    childItemInventoryNode: [],
  };
}

function addChildItemFromRaw(saveData, invKey, parentIdx, rawJson) {
  const item = parseRawItem(rawJson);

  const inv = saveData.inventories[invKey];
  const parent = inv.saveItems[parentIdx];
  if (!parent) throw new Error("Invalid parent item");

  const newIdx = inv.saveItems.length;
  const newUniqueId = saveData.currentUniqueId + 1;
  const newItem = buildNewSaveItem(item, newIdx, newUniqueId);

  const padValue = parent.childItemInventoryNode.length ? parent.childItemInventoryNode[0] : 1;
  const paddedNode = [...parent.childItemInventoryNode];
  while (paddedNode.length < parent.childItems.length) paddedNode.push(padValue);

  const newParent = {
    ...parent,
    childItems: [...parent.childItems, newIdx],
    childItemInventoryNode: [...paddedNode, padValue],
  };

  const newSaveItems = [...inv.saveItems, newItem];
  newSaveItems[parentIdx] = newParent;

  return {
    ...saveData,
    currentUniqueId: newUniqueId,
    inventories: {
      ...saveData.inventories,
      [invKey]: { ...inv, saveItems: newSaveItems },
    },
  };
}

function duplicateItem(saveData, invKey, itemIdx) {
  const inv = saveData.inventories[invKey];
  const original = inv.saveItems[itemIdx];
  if (!original) throw new Error("Invalid item index");

  const copy = JSON.parse(JSON.stringify(original));
  // The copy doesn't inherit the original's children - they'd otherwise be
  // claimed by both the original and the duplicate as childItems entries.
  copy.childItems = [];
  copy.childItemInventoryNode = [];

  const newIdx = inv.saveItems.length;
  const newUniqueId = saveData.currentUniqueId + 1;
  const newItem = buildNewSaveItem(copy, newIdx, newUniqueId);

  const newSaveItems = [...inv.saveItems, newItem];
  const parentIdx = findParentIndex(inv.saveItems, itemIdx);
  if (parentIdx !== -1) {
    const parent = newSaveItems[parentIdx];
    const padValue = parent.childItemInventoryNode.length ? parent.childItemInventoryNode[0] : 1;
    newSaveItems[parentIdx] = {
      ...parent,
      childItems: [...parent.childItems, newIdx],
      childItemInventoryNode: [...parent.childItemInventoryNode, padValue],
    };
  }

  // Some items (e.g. injectors with a genuine/counterfeit condition) carry
  // extra state in playerStore.savedItemFeatureList, keyed by the item's
  // uniqueId rather than its uuid/array position. A duplicate needs its own
  // copy of any such entry, or it'll silently fall back to default behavior
  // in-game despite looking identical to the original in the inventory.
  const existingFeatures = saveData.playerStore.savedItemFeatureList || [];
  const duplicatedFeatures = existingFeatures
    .filter(feature => feature.parentItemUniqueId === original.uniqueId)
    .map(feature => ({ ...JSON.parse(JSON.stringify(feature)), parentItemUniqueId: newUniqueId }));

  return {
    ...saveData,
    currentUniqueId: newUniqueId,
    inventories: {
      ...saveData.inventories,
      [invKey]: { ...inv, saveItems: newSaveItems },
    },
    playerStore: {
      ...saveData.playerStore,
      savedItemFeatureList: [...existingFeatures, ...duplicatedFeatures],
    },
  };
}

// uuid doubles as an item's array index throughout the save format, so
// removing an item means reindexing everything after it and rewriting every
// other item's childItems references to match.
function removeSaveItem(saveData, invKey, itemIdx) {
  const inv = saveData.inventories[invKey];
  const removedItem = inv.saveItems[itemIdx];
  if (!removedItem) throw new Error("Invalid item index");

  const remapIndex = (oldIdx) => oldIdx > itemIdx ? oldIdx - 1 : oldIdx;

  const newSaveItems = inv.saveItems
    .filter((_, i) => i !== itemIdx)
    .map((it, newIdx) => {
      const keptPositions = [];
      const newChildItems = it.childItems
        .filter((childIdx, pos) => {
          const keep = childIdx !== itemIdx;
          if (keep) keptPositions.push(pos);
          return keep;
        })
        .map(remapIndex);

      return {
        ...it,
        uuid: newIdx,
        childItems: newChildItems,
        childItemInventoryNode: keptPositions.map(pos => it.childItemInventoryNode[pos]),
      };
    });

  // Drop any savedItemFeatureList entries that referenced the removed item -
  // see duplicateItem for why this list exists and how it's keyed.
  const remainingFeatures = (saveData.playerStore.savedItemFeatureList || [])
    .filter(feature => feature.parentItemUniqueId !== removedItem.uniqueId);

  return {
    ...saveData,
    inventories: {
      ...saveData.inventories,
      [invKey]: { ...inv, saveItems: newSaveItems },
    },
    playerStore: {
      ...saveData.playerStore,
      savedItemFeatureList: remainingFeatures,
    },
  };
}

export { getTagValue, getCustomNameTag, setTagValueFromInput, makeTag, addItemTag, removeItemTag, addChildItemFromRaw, duplicateItem, removeSaveItem };
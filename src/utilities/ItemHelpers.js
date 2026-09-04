const REQUIRED_ITEM_FIELDS = [
  "identifier", "unitCount", "itemShape", "itemModifiedShape", "itemType", "name",
  "shortDescription", "flavorText", "unitBaseValue", "unitValue", "lateUnitValue",
  "backupUnitValue", "spriteAtlasPath", "spritePath", "itemTypes",
];

function getTagValue(tag) {
  return tag.valueBool || tag.valueLong || tag.valueDouble || tag.valueInt || tag.valueFloat || tag.internalValueString || null;
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

function getItemTag(item, tagName) {
  const idx = item._keys.indexOf(tagName);
  if (idx === -1) return null;
  return getTagValue(item._values[idx]);
}

function getCustomNameTag(item) {
  return getItemTag(item, "CUSTOM_NAME_TAG");
}

function extractItemFields(item, fields) {
  const record = {};
  for (const field of fields) {
    record[field.key] = field.source === "tag" ? getItemTag(item, field.name) : item[field.name];
  }
  return record;
}

function parseRawItem(rawJson) {
  const item = JSON.parse(rawJson);
  for (const f of REQUIRED_ITEM_FIELDS) {
    if (!(f in item)) throw new Error(`Missing required field "${f}"`);
  }
  return item;
}

function remapFeatureIds(features, newUniqueId) {
  return features.map(feature => ({ ...JSON.parse(JSON.stringify(feature)), parentItemUniqueId: newUniqueId }));
}

function getItemSavedFeatures(saveData, item) {
  return (saveData.playerStore.savedItemFeatureList || [])
    .filter(feature => feature.parentItemUniqueId === item.uniqueId);
}

function embedSavedFeatures(saveData, item) {
  const features = getItemSavedFeatures(saveData, item);
  return features.length ? { ...item, _savedItemFeatures: features } : item;
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

function findParentIndex(saveItems, itemIdx) {
  return saveItems.findIndex(it => Array.isArray(it.childItems) && it.childItems.includes(itemIdx));
}

function addChildItemFromRaw(saveData, invKey, parentIdx, rawJson) {
  const item = parseRawItem(rawJson);
  const embeddedFeatures = item._savedItemFeatures || [];
  delete item._savedItemFeatures;

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

  const newFeatures = remapFeatureIds(embeddedFeatures, newUniqueId);
  const existingFeatures = saveData.playerStore.savedItemFeatureList || [];

  return {
    ...saveData,
    currentUniqueId: newUniqueId,
    inventories: {
      ...saveData.inventories,
      [invKey]: { ...inv, saveItems: newSaveItems },
    },
    playerStore: {
      ...saveData.playerStore,
      savedItemFeatureList: [...existingFeatures, ...newFeatures],
    },
  };
}

function duplicateItem(saveData, invKey, itemIdx) {
  const inv = saveData.inventories[invKey];
  const original = inv.saveItems[itemIdx];
  if (!original) throw new Error("Invalid item index");

  const copy = JSON.parse(JSON.stringify(original));

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

  const existingFeatures = saveData.playerStore.savedItemFeatureList || [];
  const duplicatedFeatures = remapFeatureIds(getItemSavedFeatures(saveData, original), newUniqueId);

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

export {
  getTagValue, setTagValueFromInput, makeTag, addItemTag, removeItemTag,
  getItemTag, getCustomNameTag, extractItemFields, findParentIndex,
  embedSavedFeatures, addChildItemFromRaw, duplicateItem, removeSaveItem,
};

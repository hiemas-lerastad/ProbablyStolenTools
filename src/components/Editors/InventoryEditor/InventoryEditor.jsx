import { useContext, useState } from "react";

import { SaveDataContext } from "../../../context/SaveData.jsx"
import { INV_KEYS, INV_LABELS } from "../../../utilities/constants.js"
import { getCustomNameTag, embedSavedFeatures, addChildItemFromRaw, duplicateItem, removeSaveItem } from "../../../utilities/ItemHelpers.js"

import { ContentInput, ContentButton, InventoryItemEditor } from "../../components.js"

import "./InventoryEditor.css"

function itemMatchesFilter(item, filter, customName) {
  if (!filter) return true;
  return item.identifier.toLowerCase().includes(filter)
    || item.name.toLowerCase().includes(filter)
    || (customName && String(customName).toLowerCase().includes(filter));
}

function InventoryItemRow({ item, index, active, saveData, onSelect, onDuplicate, onDelete }) {
  const customName = getCustomNameTag(item);
  const name = customName ? `${customName} (${item.name})` : item.name;

  function handleCopyJson(e) {
    e.stopPropagation();
    navigator.clipboard.writeText(JSON.stringify(embedSavedFeatures(saveData, item), null, 2));
  }

  function handleDuplicate(e) {
    e.stopPropagation();
    onDuplicate(index);
  }

  function handleDelete(e) {
    e.stopPropagation();
    onDelete(index);
  }

  return (
    <tr className={`inventory-item ${active ? "active" : ""}`} onClick={() => onSelect(index)}>
      <td className="inventory-item-cell inventory-item-cell-index">{index}</td>
      <td className="inventory-item-cell inventory-item-cell-id">{item.identifier}</td>
      <td className="inventory-item-cell inventory-item-cell-name">{name}</td>
      <td className="inventory-item-cell inventory-item-cell-uuid">{item.uuid}</td>
      <td className="inventory-item-cell inventory-item-cell-uniqueid">{item.uniqueId}</td>
      <td className="inventory-item-cell inventory-item-cell-actions">
        <ContentButton onClickFunc={handleCopyJson} label="Copy JSON" />
        <ContentButton onClickFunc={handleDuplicate} label="Duplicate" />
        <ContentButton onClickFunc={handleDelete} label="Delete" />
      </td>
    </tr>
  );
}

function RawItemAddForm({ itemsData, onAdd }) {
  const [parentIdx, setParentIdx] = useState((itemsData || []).length ? "0" : "");
  const [rawJson, setRawJson] = useState("");
  const [error, setError] = useState("");

  function handleAdd() {
    setError("");
    try {
      onAdd(parseInt(parentIdx, 10), rawJson);
      setRawJson("");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="inventory-item-raw-add">
      <ContentInput tag="select" value={parentIdx} onChangeFunc={e => setParentIdx(e.currentTarget.value)}>
        <option value="" disabled>Select parent item...</option>
        {(itemsData || []).map((item, index) => (
          <option key={index} value={index}>[{index}] {item.identifier} ({item.name})</option>
        ))}
      </ContentInput>
      <ContentInput tag="textarea" value={rawJson} onChangeFunc={e => setRawJson(e.currentTarget.value)} placeholder="Raw item JSON" />
      <ContentButton disabled={!parentIdx || !rawJson} onClickFunc={handleAdd} label="Add Item" />
      {error && <p className="inventory-item-raw-add-error">{error}</p>}
    </div>
  );
}

function InventoryEditor({ className = "" }) {
  const { saveData, setSaveData } = useContext(SaveDataContext);
  const [activeInventory, setActiveInventory] = useState(INV_KEYS[0]);
  const [filterValue, setFilterValue] = useState("");
  const [detailIndex, setDetailIndex] = useState(undefined);

  const itemsData = saveData.inventories[activeInventory]?.saveItems;

  function handleInventoryChange(e) {
    setActiveInventory(e.currentTarget.value);
    setDetailIndex(undefined);
  }

  function handleFilterChange(e) {
    setFilterValue(e.currentTarget.value.trim().toLowerCase());
  }

  function handleDuplicateItem(idx) {
    setSaveData(prev => duplicateItem(prev, activeInventory, idx));
  }

  function handleDeleteItem(idx) {
    setSaveData(prev => removeSaveItem(prev, activeInventory, idx));
    setDetailIndex(prevIndex => {
      if (prevIndex === undefined || prevIndex === idx) return undefined;
      return prevIndex > idx ? prevIndex - 1 : prevIndex;
    });
  }

  function handleAddRawItem(parentIdx, rawJson) {
    setSaveData(prev => addChildItemFromRaw(prev, activeInventory, parentIdx, rawJson));
  }

  const rows = (itemsData || [])
    .map((item, index) => ({ item, index, customName: getCustomNameTag(item) }))
    .filter(({ item, customName }) => itemMatchesFilter(item, filterValue, customName));

  return (
    <div className={`inventory-editor ${className}`}>
      <div className="inventory-editor-filter-bar">
        <label>
          <span>Inventories: </span>
          <ContentInput tag="select" value={activeInventory} onChangeFunc={handleInventoryChange}>
            {Object.keys(saveData.inventories).map((key) => (
              <option key={key} value={key}>{INV_LABELS[key] || key}</option>
            ))}
          </ContentInput>
        </label>
        <label>
          <span>Filter: </span>
          <ContentInput type="text" onChangeFunc={handleFilterChange} />
        </label>
      </div>

      {detailIndex !== undefined &&
        <InventoryItemEditor item={itemsData[detailIndex]} index={detailIndex} invKey={activeInventory} handleClose={() => setDetailIndex(undefined)} />
      }

      <table className="inventory-item-list-table">
        <tbody className="inventory-item-list-body">
          <tr className="inventory-item inventory-item-header">
            <th className="inventory-item-cell inventory-item-cell-index">Index</th>
            <th className="inventory-item-cell inventory-item-cell-id">ID</th>
            <th className="inventory-item-cell inventory-item-cell-name">NAME</th>
            <th className="inventory-item-cell inventory-item-cell-uuid">UUID</th>
            <th className="inventory-item-cell inventory-item-cell-uniqueid">Unique ID</th>
            <th className="inventory-item-cell inventory-item-cell-actions">Actions</th>
          </tr>
          {rows.map(({ item, index }) => (
            <InventoryItemRow
              key={index}
              item={item}
              index={index}
              active={detailIndex === index}
              saveData={saveData}
              onSelect={setDetailIndex}
              onDuplicate={handleDuplicateItem}
              onDelete={handleDeleteItem}
            />
          ))}
        </tbody>
      </table>

      <RawItemAddForm key={activeInventory} itemsData={itemsData} onAdd={handleAddRawItem} />
    </div>
  );
}

export { InventoryEditor };

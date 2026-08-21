import { useContext, useState, useEffect } from "react";

import { SaveDataContext, SaveDataProvider } from "../../../../context/SaveData.jsx"

import { InventoryItem } from "../InventoryItem/InventoryItem.jsx"
import { InventoryItemDetailsForm } from "../InventoryItemDetailsForm/InventoryItemDetailsForm.jsx"
import { ContentInput } from "../../../ContentInput/ContentInput.jsx"
import { ContentButton } from "../../../ContentButton/ContentButton.jsx"

import { INV_KEYS } from "../../../../constants.js"
import { getCustomNameTag, addChildItemFromRaw, addRootItemFromRaw, duplicateItem, removeSaveItem } from "../../../../utilities/ItemHelpers.js"

import "./InventoryItemList.css"

function InventoryItemList({selectedInvKey, filter = "", className = ""}) {
  const {saveData, setSaveData} = useContext(SaveDataContext);
  const [detailIndex, setDetailIndex] = useState(undefined);
  const [rawParentIdx, setRawParentIdx] = useState("");
  const [rawJson, setRawJson] = useState("");
  const [rawError, setRawError] = useState("");
  const itemsData = saveData.inventories[selectedInvKey]?.saveItems
  var items = []

  useEffect(() => {
    setDetailIndex(undefined)
  }, [saveData.loadId])

  useEffect(() => {
    setRawParentIdx("")
    setRawError("")
  }, [selectedInvKey, saveData.loadId])

  function handleItemSelection(index) {
    setDetailIndex(index)
  }

  function handleCloseDetails() {
    setDetailIndex(undefined)
  }

  function handleDuplicateItem(idx) {
    setSaveData(prev => duplicateItem(prev, selectedInvKey, idx));
  }

  function handleDeleteItem(idx) {
    setSaveData(prev => removeSaveItem(prev, selectedInvKey, idx));
    setDetailIndex(prevIndex => {
      if (prevIndex === undefined || prevIndex === idx) return undefined;
      return prevIndex > idx ? prevIndex - 1 : prevIndex;
    });
  }

  function handleAddRawItem() {
    setRawError("")
    try {
      setSaveData(prev => rawParentIdx === "root"
        ? addRootItemFromRaw(prev, selectedInvKey, rawJson)
        : addChildItemFromRaw(prev, selectedInvKey, parseInt(rawParentIdx, 10), rawJson));
      setRawJson("")
    } catch (err) {
      setRawError(err.message)
    }
  }

  var containerOptions = []
  if (itemsData) {
    itemsData.forEach((it, i) => {
      if (it._keys.includes("CONTAINER_TAG")) containerOptions.push({ index: i, item: it });
    })
  }

  if (itemsData && itemsData.length) {
    for (const [index, item] of itemsData.entries()) {
      const customName = getCustomNameTag(item);
      if (!filter || filter == "" || item.identifier.toLowerCase().includes(filter) || item.name.toLowerCase().includes(filter) || (customName && String(customName).toLowerCase().includes(filter))) {
        items.push(<InventoryItem key={index} item={item} index={index} onSelectFunc={handleItemSelection} onDuplicateFunc={handleDuplicateItem} onDeleteFunc={handleDeleteItem} className={detailIndex == index ? "active" : ""}/>);
      }
    }
  }

  return (
    <div className={`inventory-item-list ${ className }`}>
      { detailIndex !== undefined &&
        <InventoryItemDetailsForm item={itemsData[detailIndex]} index={detailIndex} invKey={selectedInvKey} handleClose={handleCloseDetails} />
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
          { items }
        </tbody>
      </table>
      <div className="inventory-item-raw-add">
        <ContentInput tag="select" value={rawParentIdx} onChangeFunc={e => setRawParentIdx(e.currentTarget.value)} >
          <option value="" disabled>Select container...</option>
          <option value="root">Selected inventory (no container)</option>
          {containerOptions.map(({index, item}) => (
            <option key={index} value={index}>[{index}] {item.identifier} ({item.name})</option>
          ))}
        </ContentInput>
        <ContentInput tag="textarea" value={rawJson} onChangeFunc={e => setRawJson(e.currentTarget.value)} placeholder="Raw item JSON" />
        <ContentButton disabled={!rawParentIdx || !rawJson} onClickFunc={handleAddRawItem} label="Add Item" />
        {rawError && <p className="inventory-item-raw-add-error">{rawError}</p>}
      </div>
    </div>
  );
}

export { InventoryItemList };
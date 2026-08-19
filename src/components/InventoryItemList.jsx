import { useContext, useState, useEffect } from "react";

import { SaveDataContext, SaveDataProvider } from "../context/SaveData.jsx"

import { InventoryItem } from "./InventoryItem.jsx"
import { InventoryItemDetailsForm } from "./InventoryItemDetailsForm.jsx"

import { INV_KEYS } from "../constants.js"

function InventoryItemList(selectedInvKey, className = "") {
  if (!selectedInvKey) selectedInvKey = INV_KEYS[0];
  const {saveData, setSaveData} = useContext(SaveDataContext);
  const [detailItem, setDetailItem] = useState(undefined);
  const itemsData = saveData.inventories[INV_KEYS[0]].saveItems
  var items = []

  function handleItemSelection(index) {
    setDetailItem(itemsData[index])
  }

  function handleCloseDetails() {
    console.log("here")
    setDetailItem(false)
  }

  for (const [index, item] of itemsData.entries()) {
    items.push(<InventoryItem key={index} item={item} index={index} onSelectFunc={handleItemSelection}/>);
  }

  return (
    <div className={`inventory-item-list ${ className }`}>
      { detailItem &&
        <InventoryItemDetailsForm item={detailItem} handleClose={handleCloseDetails} />
      }
      <table className="inventory-item-list-table">
        <tbody className="inventory-item-list-body">
          { items }
        </tbody>
      </table>
    </div>
  );
}

export { InventoryItemList };
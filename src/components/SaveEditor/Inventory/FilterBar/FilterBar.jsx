import { useContext, useState, useEffect } from "react";

import { SaveDataContext } from "../../../../context/SaveData.jsx"
import { IconButton } from "../../../IconButton/IconButton.jsx"
import { INV_LABELS } from "../../../../constants.js"

function DropdownOption({index,value, name}) {
  return(
    <option key={index} value={value}>{name}</option>
  );
}

function FilterBar({ onInventorySelected, onInventoryFiltered }) {
  const {saveData, setSaveData} = useContext(SaveDataContext);

  const inventories = Object.keys(saveData.invLineIndexes)

  function handleInventoryChange(e) {
    var selectedInvKey = e.target.value;

    if (onInventorySelected) {
      onInventorySelected(selectedInvKey)
    }
  }

  function handleFilterChange(e) {
    var filterValue = e.target.value.trim().toLowerCase();

    if (onInventoryFiltered) {
      onInventoryFiltered(filterValue)
    }
  }

  var inventorySelectors = []

  for (const [index, item] of inventories.entries()) {
    inventorySelectors.push(<DropdownOption index={index} value={item} name={INV_LABELS[item]}/>);
  }

  return (
    <div className="filter-bar">
      <label>
        <span>Inventories: </span>
        <select onChange={handleInventoryChange}>
          {inventorySelectors}
        </select>
      </label>
      <label>
        <span>Filter: </span>
        <input type="text" onChange={handleFilterChange}/>
      </label>
    </div>
  );
}

export { FilterBar };
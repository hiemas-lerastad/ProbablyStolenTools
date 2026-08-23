import { useContext, useState, useEffect } from "react";

import { getCustomNameTag, embedSavedFeatures } from "../../../../utilities/ItemHelpers.js"
import { IconButton } from "../../../IconButton/IconButton.jsx"
import { ContentButton } from "../../../ContentButton/ContentButton.jsx"

import { SaveDataContext } from "../../../../context/SaveData.jsx"

import "./InventoryItem.css"

function InventoryItem({ index, item, className = "", onSelectFunc, onDuplicateFunc, onDeleteFunc }) {
  const { saveData } = useContext(SaveDataContext);

  function handleSelect() {
    if (onSelectFunc) {
      onSelectFunc(index)
    }
  }

  function handleCopyJson(e) {
    e.stopPropagation();
    navigator.clipboard.writeText(JSON.stringify(embedSavedFeatures(saveData, item), null, 2));
  }

  function handleDuplicate(e) {
    e.stopPropagation();
    if (onDuplicateFunc) {
      onDuplicateFunc(index)
    }
  }

  function handleDelete(e) {
    e.stopPropagation();
    if (onDeleteFunc) {
      onDeleteFunc(index)
    }
  }

  var name = item.name
  const customName = getCustomNameTag(item);

  if (customName) {
    name = customName + ' (' + item.name + ')'
  }

  return (
    <tr className={`inventory-item ${ className }`} onClick={handleSelect}>
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

export { InventoryItem };
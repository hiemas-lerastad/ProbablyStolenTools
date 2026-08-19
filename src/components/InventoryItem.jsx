import { useContext, useState, useEffect } from "react";

import { IconButton } from "./IconButton.jsx"

function InventoryItem({ index, item, className = "", onSelectFunc }) {

  function handleSelect() {
    if (onSelectFunc) {
      onSelectFunc(index)
    }
  }

  return (
    <tr className={`inventory-item ${ className }`} onClick={handleSelect}>
      <td className="inventory-item-cell inventory-item-cell-index">{index}</td>
      <td className="inventory-item-cell inventory-item-cell-id">{item.identifier}</td>
      <td className="inventory-item-cell inventory-item-cell-name">{item.name}</td>
      <td className="inventory-item-cell inventory-item-cell-uuid">{item.uuid}</td>
      <td className="inventory-item-cell inventory-item-cell-uniqueid">{item.uniqueId}</td>
    </tr>
  );
}

export { InventoryItem };
import { useContext, useState, useEffect } from "react";

import { InfoCard } from "./InfoCard.jsx"


function InventoryItemDetailsForm({item, handleClose}) {
  console.log(item)
  return (
    <InfoCard title={item.name} enableClose={true} closeFunc={handleClose} className="inventory-item-details-card">
      
    </InfoCard>
  );
}

export { InventoryItemDetailsForm };
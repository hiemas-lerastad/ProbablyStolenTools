import React, { useState, useContext, useEffect } from 'react';


import { InfoCard } from "../../InfoCard/InfoCard.jsx"
import { ItemFeatureListEditor } from "../ItemFeatureListEditor/ItemFeatureListEditor.jsx"
import { StoreClientManagerEditor } from "../StoreClientManagerEditor/StoreClientManagerEditor.jsx"

function AdvancedEditor(props) {
  const [itemFeatureListExpanded, setItemFeatureListExpanded] = useState(false);
  const [storeClientManagerExpanded, setStoreClientManagerExpanded] = useState(false);

  function toggleItemFeatureList() {
    setItemFeatureListExpanded(!itemFeatureListExpanded)
  }

  function toggleStoreClientManager() {
    setStoreClientManagerExpanded(!storeClientManagerExpanded)
  }

  return (
    <>
      { itemFeatureListExpanded ?
        <InfoCard title="Item Feature List" enableClose={true} closeFunc={toggleItemFeatureList} className="content-card">
          <ItemFeatureListEditor />
        </InfoCard>
        :
        <InfoCard title="Item Feature List" enableClose={true} closeFunc={toggleItemFeatureList} iconName="plus" className="content-card"/>
      }
      { storeClientManagerExpanded ?
        <InfoCard title="Store Client Manager" enableClose={true} closeFunc={toggleStoreClientManager}>
          <StoreClientManagerEditor />
        </InfoCard>
        :
        <InfoCard title="Store Client Manager" enableClose={true} closeFunc={toggleStoreClientManager} iconName="plus" />
      }
    </>
  );
}


export { AdvancedEditor }

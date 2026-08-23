import React, { useState, useContext, useEffect } from 'react';


import { InfoCard } from "../../InfoCard/InfoCard.jsx"
import { ItemFeatureListEditor } from "../ItemFeatureListEditor/ItemFeatureListEditor.jsx"

function AdvancedEditor(props) {
  const [itemFeatureListExpanded, setItemFeatureListExpanded] = useState(false);

  function toggleItemFeatureList() {
    setItemFeatureListExpanded(!itemFeatureListExpanded)
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
    </>
  );
}


export { AdvancedEditor }

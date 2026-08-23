import React, { useState, useContext, useEffect } from 'react';

import '../App.css'

import { SaveDataContext, SaveDataProvider } from "../context/SaveData.jsx"

import { ContentPanel } from "../components/ContentPanel/ContentPanel.jsx"

import { IconButton } from "../components/IconButton/IconButton.jsx"
import { InfoCard } from "../components/InfoCard/InfoCard.jsx"
import { SaveLoader } from "../components/SaveEditor/SaveLoader/SaveLoader.jsx"
import { FilterBar } from "../components/SaveEditor/Inventory/FilterBar/FilterBar.jsx"
import { InventoryItemList } from "../components/SaveEditor/Inventory/InventoryItemList/InventoryItemList.jsx"
import { PropertyEditor } from "../components/SaveEditor/PropertyEditor/PropertyEditor.jsx"
import { ReputationEditor } from "../components/SaveEditor/ReputationEditor/ReputationEditor.jsx"
import { AdvancedEditor } from "../components/SaveEditor/AdvancedEditor/AdvancedEditor.jsx"


import { INV_KEYS } from "../constants.js"

function Main(props) {
  const {saveData, setSaveData} = useContext(SaveDataContext);
  const [activeInventory, setActiveInventory] = useState(INV_KEYS[0])
  const [filterValue, setFilterValue] = useState("");

  const [storeExpanded, setStoreExpanded] = useState(false);
  const [playerExpanded, setPlayerExpanded] = useState(false);
  const [reputationExpanded, setReputationExpanded] = useState(false);
  const [inventoryExpanded, setInventoryExpanded] = useState(false);
  const [advancedExpanded, setAdvancedExpanded] = useState(false);

  function handleInventoryChange(value) {
    setActiveInventory(value)
  }

  function handleFilterChange(value) {
    setFilterValue(value)
  }

  function toggleInventory() {
    setInventoryExpanded(!inventoryExpanded)
  }

  function toggleStore() {
    setStoreExpanded(!storeExpanded)
  }

  function togglePlayer() {
    setPlayerExpanded(!playerExpanded)
  }

  function toggleReputation() {
    setReputationExpanded(!reputationExpanded)
  }

  function toggleAdvanced() {
    setAdvancedExpanded(!advancedExpanded)
  }

  const nav = (<IconButton onClickFunc={() => {}} iconName="home" className="main-nav-home" tag="a" href="/ProbablyStolenTools/" />)

  const header = (
    <>
      <SaveLoader />
    </>
  );

  return (
    <ContentPanel title="SAVE EDITOR" nav={nav} header={header}>
      {saveData &&
        <>
          { storeExpanded ? 
            <InfoCard title="Store" enableClose={true} closeFunc={toggleStore} className="content-card">
              <PropertyEditor propertyName="STORE_FIELDS" />
            </InfoCard>
            :
            <InfoCard title="Store" enableClose={true} closeFunc={toggleStore} iconName="plus" className="content-card"/>
          }
          { playerExpanded ? 
            <InfoCard title="Player" enableClose={true} closeFunc={togglePlayer} className="content-card">
              <PropertyEditor propertyName="PLAYER_FIELDS" />
            </InfoCard>
            :
            <InfoCard title="Player" enableClose={true} closeFunc={togglePlayer} iconName="plus" className="content-card"/>
          }
          { reputationExpanded ? 
            <InfoCard title="Reputation" enableClose={true} closeFunc={toggleReputation} className="content-card">
              <ReputationEditor />
            </InfoCard>
            :
            <InfoCard title="Reputation" enableClose={true} closeFunc={toggleReputation} iconName="plus" className="content-card"/>
          }
          { inventoryExpanded ? 
            <InfoCard title="Inventory" enableClose={true} closeFunc={toggleInventory} className="content-card">
              <FilterBar selectedInvKey={activeInventory} onInventorySelected={handleInventoryChange} onInventoryFiltered={handleFilterChange}/>
              <InventoryItemList filter={filterValue} selectedInvKey={activeInventory} />
            </InfoCard>
            :
            <InfoCard title="Inventory" enableClose={true} closeFunc={toggleInventory} iconName="plus" className="content-card"/>
          }
          { advancedExpanded ? 
            <InfoCard title="Advanced" enableClose={true} closeFunc={toggleAdvanced} className="content-card">
              <AdvancedEditor />
            </InfoCard>
            :
            <InfoCard title="Advanced" enableClose={true} closeFunc={toggleAdvanced} iconName="plus" className="content-card"/>
          }
        </>
      }
    </ContentPanel>
  );
}

function App() {
  return (
    <SaveDataProvider>
      <Main />
    </SaveDataProvider>
  )
}

export default App

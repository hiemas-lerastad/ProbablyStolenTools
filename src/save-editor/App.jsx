import React, { useState, useContext, useEffect } from 'react';

import '../App.css'

import { SaveDataContext, SaveDataProvider } from "../context/SaveData.jsx"

import { ContentPanel } from "../components/ContentPanel/ContentPanel.jsx"

import { IconButton } from "../components/IconButton/IconButton.jsx"
import { SaveLoader } from "../components/SaveEditor/SaveLoader/SaveLoader.jsx"
import { FilterBar } from "../components/SaveEditor/Inventory/FilterBar/FilterBar.jsx"
import { InventoryItemList } from "../components/SaveEditor/Inventory/InventoryItemList/InventoryItemList.jsx"
import { StatsEditor } from "../components/SaveEditor/StatsEditor/StatsEditor.jsx"


import { INV_KEYS } from "../constants.js"

function Main(props) {
  const {saveData, setSaveData} = useContext(SaveDataContext);
  const [activeInventory, setActiveInventory] = useState(INV_KEYS[0])
  const [filterValue, setFilterValue] = useState("");

  function handleInventoryChange(value) {
    setActiveInventory(value)
  }

  function handleFilterChange(value) {
    setFilterValue(value)
  }

  const nav = (<IconButton onClickFunc={() => {}} iconName="home" className="main-nav-home" tag="a" href="/ProbablyStolenTools/" />)

  const header = (
    <>
      <SaveLoader />
      { saveData &&
        <StatsEditor />
      }
    </>)

  return (
    <ContentPanel title="SAVE EDITOR" nav={nav} header={header}>
      {saveData &&
        <>
          <FilterBar onInventorySelected={handleInventoryChange} onInventoryFiltered={handleFilterChange}/>
          <InventoryItemList filter={filterValue} selectedInvKey={activeInventory} />
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

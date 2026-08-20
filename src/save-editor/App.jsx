import React, { useState, useContext, useEffect } from 'react';

import '../App.css'

import { SaveDataContext, SaveDataProvider } from "../context/SaveData.jsx"

import { IconButton } from "../components/IconButton/IconButton.jsx"
import { SaveLoader } from "../components/SaveEditor/SaveLoader/SaveLoader.jsx"
import { FilterBar } from "../components/SaveEditor/Inventory/FilterBar/FilterBar.jsx"
import { InventoryItemList } from "../components/SaveEditor/Inventory/InventoryItemList/InventoryItemList.jsx"
import { INV_KEYS } from "../constants.js"

import diagonalImg from "../assets/Diagonal.png"

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

  return (
    <div className="main">
      <div className="main-nav">
        <IconButton onClickFunc={() => {}} iconName="home" className="main-nav-home" tag="a" href="/ProbablyStolenTools/" />
      </div>
      <div className="main-inner">
        <div className="main-title-row">
          <img src={diagonalImg}  className="main-title-diagonal"/>
          <h1 className="main-title">
            SAVE EDITOR
          </h1>
          <img src={diagonalImg}  className="main-title-diagonal main-title-diagonal-right"/>
        </div>
        <div className="main-header">
          <SaveLoader />
          {saveData &&
            <FilterBar onInventorySelected={handleInventoryChange} onInventoryFiltered={handleFilterChange}/>
          }
          <div className="main-header-separator">
            <img src={diagonalImg}  className="main-title-diagonal"/>
            <div className="main-header-separator-body"></div>
            <img src={diagonalImg}  className="main-title-diagonal main-title-diagonal-right"/>
          </div>
        </div>
        <div className="main-content">
          {saveData &&
            <InventoryItemList filter={filterValue} selectedInvKey={activeInventory} />
          }
        </div>
      </div>
    </div>
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

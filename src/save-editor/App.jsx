import React, { useState, useContext, useEffect } from 'react';

import '../App.css'

import { SaveDataContext, SaveDataProvider } from "../context/SaveData.jsx"

import { IconButton } from "../components/IconButton.jsx"
import { SaveLoader } from "../components/SaveLoader.jsx"
import { InventoryItemList } from "../components/InventoryItemList.jsx"

import diagonalImg from "../assets/Diagonal.png"

function Main(props) {
  const [activeTab, setActiveTab] = useState('recommendations')
  const {saveData, setSaveData} = useContext(SaveDataContext);
  console.log(saveData)
  return (
    <div className="main">
      <div className="main-nav">
        <IconButton onClickFunc={() => {setActiveTab('home')}} iconName="home" className="main-nav-home" />
        <IconButton onClickFunc={() => {console.log("info"); setActiveTab('info')}} iconName="info" className="main-nav-info" />
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
          <div className="main-header-separator">
            <img src={diagonalImg}  className="main-title-diagonal"/>
            <div className="main-header-separator-body"></div>
            <img src={diagonalImg}  className="main-title-diagonal main-title-diagonal-right"/>
          </div>
        </div>
        <div className="main-content">
          {saveData &&
            <InventoryItemList />
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

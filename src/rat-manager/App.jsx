import React, { useState, useContext, useEffect } from 'react';

import '../App.css'

import { RatDataContext, RatDataProvider } from "../context/RatData.jsx"

import { ReccomendationsMenu } from "../components/RatManager/Recommendations/Recommendations.jsx"
import { InfoMenu } from "../components/Info/Info.jsx"
import { IconButton } from "../components/IconButton/IconButton.jsx"
import { Key } from "../components/RatManager/Key/Key.jsx"

import diagonalImg from "../assets/Diagonal.png"

function Main(props) {
  const [activeTab, setActiveTab] = useState('recommendations')
  const {ratData, setRatData} = useContext(RatDataContext);

  return (
    <div className="main">
      <div className="main-nav">
        <IconButton onClickFunc={() => {}} iconName="home" className="main-nav-home" tag="a" href="/ProbablyStolenTools/" />
      </div>
      <div className="main-inner">
        <div className="main-title-row">
          <img src={diagonalImg}  className="main-title-diagonal"/>
          <h1 className="main-title">
            RAT MANAGER
          </h1>
          <img src={diagonalImg}  className="main-title-diagonal main-title-diagonal-right"/>
        </div>
        <div className="main-header">
          <Key />
          <div className="main-header-separator">
            <img src={diagonalImg}  className="main-title-diagonal"/>
            <div className="main-header-separator-body"></div>
            <img src={diagonalImg}  className="main-title-diagonal main-title-diagonal-right"/>
          </div>
        </div>
        <div className="main-content">
          {ratData && activeTab == 'recommendations' &&
            <ReccomendationsMenu />
          }
          {activeTab == 'info' &&
            <InfoMenu />
          }
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <RatDataProvider>
      <Main />
    </RatDataProvider>
  )
}

export default App

import React, { useState, useContext, useEffect } from 'react';

import '../App.css'

import { RatDataContext, RatDataProvider } from "../context/RatData.jsx"

import { ContentPanel } from "../components/ContentPanel/ContentPanel.jsx"
import { ReccomendationsMenu } from "../components/RatManager/Recommendations/Recommendations.jsx"
import { InfoMenu } from "../components/Info/Info.jsx"
import { IconButton } from "../components/IconButton/IconButton.jsx"
import { Key } from "../components/RatManager/Key/Key.jsx"
import { SaveLoader } from "../components/SaveEditor/SaveLoader/SaveLoader.jsx"
import { ContentButton } from "../components/ContentButton/ContentButton.jsx"

import { extractRatsFromSave } from "../utilities/RatHelpers.js"

function Main(props) {
  const [activeTab, setActiveTab] = useState('recommendations')
  const {ratData, setRatData} = useContext(RatDataContext);

  function handleSaveLoaded(state) {
    setRatData(extractRatsFromSave(state))
  }

  function handleClearRats() {
    setRatData([])
  }

  const nav = (<IconButton onClickFunc={() => {}} iconName="home" className="main-nav-home" tag="a" href="/ProbablyStolenTools/" />)
  const header = (
    <>
      <SaveLoader onLoad={handleSaveLoaded} />
      <ContentButton onClickFunc={handleClearRats} label="Clear Rats" className="rat-manager-clear"/>
      <Key />
    </>
  );

  return (
    <ContentPanel title="RAT MANAGER" nav={nav} header={header}>
      {ratData && activeTab == 'recommendations' &&
        <ReccomendationsMenu />
      }
      {activeTab == 'info' &&
        <InfoMenu />
      }
    </ContentPanel>
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

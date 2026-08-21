import React, { useState, useContext, useEffect } from 'react';

import '../App.css'

import { RatDataContext, RatDataProvider } from "../context/RatData.jsx"

import { ContentPanel } from "../components/ContentPanel/ContentPanel.jsx"
import { ReccomendationsMenu } from "../components/RatManager/Recommendations/Recommendations.jsx"
import { InfoMenu } from "../components/Info/Info.jsx"
import { IconButton } from "../components/IconButton/IconButton.jsx"
import { Key } from "../components/RatManager/Key/Key.jsx"

function Main(props) {
  const [activeTab, setActiveTab] = useState('recommendations')
  const {ratData, setRatData} = useContext(RatDataContext);

  const nav = (<IconButton onClickFunc={() => {}} iconName="home" className="main-nav-home" tag="a" href="/ProbablyStolenTools/" />)
  const header = (<Key />)

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

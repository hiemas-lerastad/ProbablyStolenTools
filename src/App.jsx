import React, { useState, useContext, useEffect } from 'react';

import { RatDataContext, RatDataProvider } from "./context/RatData.jsx"

function Main(props) {
  const [activeTab, setActiveTab] = useState('')
  const {ratData, setRatData} = useContext(RatDataContext);

  function TabMenu() {
    return (
      <div>
        <button onClick={() => {setActiveTab('recommendations')}}>
          Reccomendations
        </button>
        <button onClick={() => {setActiveTab('add')}}>
          Add New Rat
        </button>
        <button onClick={() => {setActiveTab('info')}}>
          Info
        </button>
      </div>
    )
  }

  return (
    <div className="main">
      <p className="main__title">Probably Stolen: Rat Colony Manager</p>
      {ratData &&
        <TabMenu />
      }
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

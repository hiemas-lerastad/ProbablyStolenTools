import React, { useState, useContext, useEffect } from 'react';

import "../App.css";

import { SaveDataContext, SaveDataProvider } from "../context/SaveData.jsx"

import { ContentPanel, InfoPanel, IconButton, SaveHandler, PropertyEditor, ReputationEditor, SchemaEditor, InventoryEditor } from "../components/components.js"
import { STARTING_PERKS_SCHEMA, ITEM_FEATURE_LIST_SCHEMA, CLIENT_MANAGER_SCHEMA } from "../utilities/constants.js"

const STARTING_PERKS = [STARTING_PERKS_SCHEMA];
const ITEM_FEATURE_LIST = [ITEM_FEATURE_LIST_SCHEMA];

function Main(props) {
  const {saveData, setSaveData} = useContext(SaveDataContext);

  function handleSaveLoaded(state) {
    setSaveData({ ...state, loadId: Date.now() })
  }

  const nav = (<IconButton onClickFunc={() => {}} iconName="home" className="main-nav-home" tag="a" href="/ProbablyStolenTools/" />)

  const header = (
    <>
      <InfoPanel title={"Save Manager"} collapsable={true}>
        <SaveHandler downloadData={saveData} onLoad={handleSaveLoaded} />
      </InfoPanel>
    </>
  )

  return (
    <ContentPanel title="SAVE EDITOR" header={header} nav={nav}>
      {saveData &&
       <>
        <InfoPanel title="Store" collapsable={true} collapsedState={true}>
          <PropertyEditor propertyName="STORE_FIELDS" />
        </InfoPanel>
        <InfoPanel title="Player" collapsable={true} collapsedState={true}>
          <PropertyEditor propertyName="PLAYER_FIELDS" />
        </InfoPanel>
        <InfoPanel title="Reputation" collapsable={true} collapsedState={true}>
          <ReputationEditor />
        </InfoPanel>
        <InfoPanel title="Perks" collapsable={true} collapsedState={true}>
          <SchemaEditor schema={STARTING_PERKS} />
        </InfoPanel>
        <InfoPanel title="Inventory" collapsable={true} collapsedState={true}>
          <InventoryEditor key={saveData.loadId} />
        </InfoPanel>
        <InfoPanel title="Advanced" collapsable={true} collapsedState={true}>
          <InfoPanel title="Item Feature List" collapsable={true} collapsedState={true} className="details-card">
            <SchemaEditor schema={ITEM_FEATURE_LIST} />
          </InfoPanel>
          <InfoPanel title="Client Manager" collapsable={true} collapsedState={true} className="details-card">
            <SchemaEditor schema={CLIENT_MANAGER_SCHEMA} />
          </InfoPanel>
        </InfoPanel>
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

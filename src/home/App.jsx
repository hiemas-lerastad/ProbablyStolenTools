import React, { useState, useContext, useEffect } from 'react';

import '../App.css'

import { ContentPanel } from "../components/ContentPanel/ContentPanel.jsx"
import { ContentButton } from "../components/ContentButton/ContentButton.jsx"
import { IconButton } from "../components/IconButton/IconButton.jsx"

function Main(props) {
  const nav = (<IconButton onClickFunc={() => {}} iconName="home" className="main-nav-home" tag="a" href="/ProbablyStolenTools/" />)

  const header = (
    <>
    </>)

  return (
    <ContentPanel title="HOME" nav={nav} header={header} className="home">
      <div className="home-inner">
        <ContentButton tag="a" href="/ProbablyStolenTools/save-editor" label="Save Editor" />
        <ContentButton tag="a" href="/ProbablyStolenTools/rat-manager" label="Rat Manager" />
      </div>
    </ContentPanel>
  );
}

function App() {
  return (
    <Main />
  )
}

export default App

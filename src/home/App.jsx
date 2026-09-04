import React, { useState, useContext, useEffect } from 'react';

import '../App.css'

import { ContentPanel, ContentButton, IconButton } from "../components/components.js"

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

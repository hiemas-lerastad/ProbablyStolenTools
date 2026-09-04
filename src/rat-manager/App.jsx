import React, { useState, useContext, useEffect, useMemo } from 'react';

import "../App.css";
import "./RatManager.css";

import { SaveDataContext, SaveDataProvider } from "../context/SaveData.jsx"
import { RatDataContext, RatDataProvider } from "../context/RatData.jsx"
import { RAT_SORT_FIELDS } from "../utilities/constants.js"
import { sortAndFilterRats } from "../utilities/RatHelpers.js"

import { ContentPanel, InfoPanel, IconButton, SaveHandler, ContentInput, EditableField, RatCard } from "../components/components.js"

const VALUE_FILTER_FIELDS = RAT_SORT_FIELDS.filter(field => field.numeric);

function RatParentFilter({ parentOptions, parentFilter, setParentFilter }) {
  function toggleParent(name) {
    setParentFilter(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  }

  return (
    <InfoPanel title="Container" collapsable={true} collapsedState={true} className="details-card">
      {parentOptions.map(name => (
        <EditableField
          key={name}
          label={name}
          type="checkbox"
          value={parentFilter.includes(name)}
          onValueChange={() => toggleParent(name)}
        />
      ))}
    </InfoPanel>
  );
}

function RatListControls({ sexFilter, setSexFilter, sortKey, setSortKey, sortDir, setSortDir, valueFilterKey, setValueFilterKey, valueFilterMin, setValueFilterMin, valueFilterMax, setValueFilterMax, parentOptions, parentFilter, setParentFilter }) {
  return (
    <div className="rat-list-controls">
      <label>
        <span>Sex: </span>
        <ContentInput tag="select" value={sexFilter} onChangeFunc={e => setSexFilter(e.currentTarget.value)}>
          <option value="ALL">All</option>
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
        </ContentInput>
      </label>
      <label>
        <span>Sort by: </span>
        <ContentInput tag="select" value={sortKey} onChangeFunc={e => setSortKey(e.currentTarget.value)}>
          {RAT_SORT_FIELDS.map(field => (
            <option key={field.key} value={field.key}>{field.label}</option>
          ))}
        </ContentInput>
      </label>
      <label>
        <span>Direction: </span>
        <ContentInput tag="select" value={sortDir} onChangeFunc={e => setSortDir(e.currentTarget.value)}>
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </ContentInput>
      </label>
      <label>
        <span>Filter by: </span>
        <ContentInput tag="select" value={valueFilterKey} onChangeFunc={e => setValueFilterKey(e.currentTarget.value)}>
          <option value="">(none)</option>
          {VALUE_FILTER_FIELDS.map(field => (
            <option key={field.key} value={field.key}>{field.label}</option>
          ))}
        </ContentInput>
      </label>
      {valueFilterKey &&
        <>
          <label>
            <span>Min: </span>
            <ContentInput type="number" value={valueFilterMin} onChangeFunc={e => setValueFilterMin(e.currentTarget.value)} />
          </label>
          <label>
            <span>Max: </span>
            <ContentInput type="number" value={valueFilterMax} onChangeFunc={e => setValueFilterMax(e.currentTarget.value)} />
          </label>
        </>
      }
      {parentOptions.length > 0 &&
        <RatParentFilter parentOptions={parentOptions} parentFilter={parentFilter} setParentFilter={setParentFilter} />
      }
    </div>
  );
}

function RatScoreConfigEditor() {
  const { scoreFields, updateScoreTier } = useContext(RatDataContext);

  return (
    <>
      {Object.keys(scoreFields).map((statKey) => (
        <InfoPanel key={statKey} title={statKey} collapsable={true} className="details-card">
          <div className="rat-score-fields">
            {Object.keys(scoreFields[statKey]).map((tier) => (
              <EditableField
                key={tier}
                label={tier}
                type="number"
                value={scoreFields[statKey][tier]}
                onValueChange={(_, v) => updateScoreTier(statKey, tier, v)}
              />
            ))}
          </div>
        </InfoPanel>
      ))}
    </>
  );
}

function RatRecommendationConfigEditor() {
  const { recommendationFields, updateRecommendationField } = useContext(RatDataContext);

  return (
    <>
      {recommendationFields.map((recommendation) => (
        <InfoPanel key={recommendation.tier} title={recommendation.tier} collapsable={true} className="details-card">
          <div className="rat-score-fields">
            <EditableField
              label="label"
              type="text"
              value={recommendation.label}
              onValueChange={(_, v) => updateRecommendationField(recommendation.tier, "label", v)}
            />
            {recommendation.threshold != null &&
              <EditableField
                label="threshold"
                type="number"
                value={recommendation.threshold}
                onValueChange={(_, v) => updateRecommendationField(recommendation.tier, "threshold", v)}
              />
            }
          </div>
        </InfoPanel>
      ))}
    </>
  );
}

function RatManagerBody() {
  const { all } = useContext(RatDataContext);

  const [sexFilter, setSexFilter] = useState("ALL");
  const [sortKey, setSortKey] = useState("totalScore");
  const [sortDir, setSortDir] = useState("desc");
  const [valueFilterKey, setValueFilterKey] = useState("");
  const [valueFilterMin, setValueFilterMin] = useState("");
  const [valueFilterMax, setValueFilterMax] = useState("");
  const [parentFilter, setParentFilter] = useState([]);

  const parentOptions = useMemo(
    () => [...new Set(all.map(rat => rat.parentItem).filter(Boolean))].sort(),
    [all]
  );

  const view = { sexFilter, sortKey, sortDir, valueFilterKey, valueFilterMin, valueFilterMax, parentFilter };
  const rats = useMemo(
    () => sortAndFilterRats(all, view),
    [all, sexFilter, sortKey, sortDir, valueFilterKey, valueFilterMin, valueFilterMax, parentFilter]
  );

  return (
    <>
      <RatListControls
        sexFilter={sexFilter} setSexFilter={setSexFilter}
        sortKey={sortKey} setSortKey={setSortKey}
        sortDir={sortDir} setSortDir={setSortDir}
        valueFilterKey={valueFilterKey} setValueFilterKey={setValueFilterKey}
        valueFilterMin={valueFilterMin} setValueFilterMin={setValueFilterMin}
        valueFilterMax={valueFilterMax} setValueFilterMax={setValueFilterMax}
        parentOptions={parentOptions} parentFilter={parentFilter} setParentFilter={setParentFilter}
      />
      <div className="rat-card-list">
        {rats.map((rat) => <RatCard key={rat.uniqueId} rat={rat} />)}
      </div>
    </>
  );
}

function Main(props) {
  const {saveData, setSaveData} = useContext(SaveDataContext);

  function handleSaveLoaded(state) {
    setSaveData({ ...state, loadId: Date.now() })
  }

  const nav = (<IconButton onClickFunc={() => {}} iconName="home" className="main-nav-home" tag="a" href="/ProbablyStolenTools/" />)

  const header = (
    <>
      <InfoPanel title={"Save Manager"} collapsable={true}>
        <SaveHandler onLoad={handleSaveLoaded} />
      </InfoPanel>
      <InfoPanel title="Settings" collapsable={true} collapsedState={true}>
        <RatScoreConfigEditor />
        <RatRecommendationConfigEditor />
      </InfoPanel>
    </>
  )
  return (
    <RatDataProvider>
      <ContentPanel title="Rat Manager" header={header} nav={nav}>
        {saveData && <RatManagerBody />}
      </ContentPanel>
    </RatDataProvider>
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

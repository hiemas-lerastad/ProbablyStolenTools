import { useContext, useState, useEffect } from "react";

import { SaveDataContext, SaveDataProvider } from "../../../context/SaveData.jsx"
import { PLAYER_STORE_FIELDS } from "../../../constants.js"

import { ContentInput } from "../../ContentInput/ContentInput.jsx"

import "./StatsEditor.css"

function EditableField({label, value, type, onValueChange}) {
  function handleValueChange(e) {
    if (onValueChange) {
      onValueChange(label, type === "bool" ? e.currentTarget.checked : e.currentTarget.value)
    }
  }

  return (
    <label className="stats-editor-field">
      <span>{label}</span>
      <ContentInput type={type} value={value} checked={value} onChangeFunc={handleValueChange}/>
    </label>
  );
}

function StatsEditor({className = ""}) {
  const {saveData, setSaveData} = useContext(SaveDataContext);

  function handlePlayerFieldChange(field, value, type) {
    const parsedValue = type === "number" ? Number(value) : value;
    setSaveData(prev => ({
      ...prev,
      playerStore: { ...prev.playerStore, [field]: parsedValue },
    }));
  }

  var playerFields = []
  for (const [field, type] of PLAYER_STORE_FIELDS) {
    var value = saveData.playerStore[field]
    playerFields.push(<EditableField key={field} label={field} value={value} type={type} onValueChange={(f, v) => handlePlayerFieldChange(f, v, type)}/>)
  }

  return (
    <div className={`stats-editor ${ className }`}>
      {playerFields}
    </div>
  );
}

export { StatsEditor };
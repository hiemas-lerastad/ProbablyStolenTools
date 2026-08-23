import { useContext, useState } from "react";

import { SaveDataContext } from "../../../context/SaveData.jsx"
import { STORE_CLIENT_MANAGER_FIELDS, STORE_CLIENT_MANAGER_RAW_FIELDS } from "../../../constants.js"

import { EditableField } from "../../EditableField/EditableField.jsx"
import { ContentInput } from "../../ContentInput/ContentInput.jsx"
import { ContentButton } from "../../ContentButton/ContentButton.jsx"

import "./StoreClientManagerEditor.css"

function defaultValueForType(type) {
  if (type === "number") return 0;
  if (type === "checkbox") return false;
  return "";
}

function RawField({label, value}) {
  const {setSaveData} = useContext(SaveDataContext);
  const [text, setText] = useState(() => JSON.stringify(value ?? null, null, 2));
  const [error, setError] = useState("");

  function handleApply() {
    try {
      const parsed = JSON.parse(text);
      setError("");
      setSaveData(prev => ({
        ...prev,
        playerStore: {
          ...prev.playerStore,
          storeClientManager: { ...prev.playerStore.storeClientManager, [label]: parsed },
        },
      }));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="store-client-manager-raw-field">
      <div className="editable-section-heading">{label}</div>
      <ContentInput tag="textarea" value={text} onChangeFunc={e => setText(e.currentTarget.value)} className="details-input"/>
      <ContentButton onClickFunc={handleApply} label="Apply" className="details-button"/>
      {error && <p className="store-client-manager-error">{error}</p>}
    </div>
  );
}

function StoreClientManagerEditor({className = ""}) {
  const {saveData, setSaveData} = useContext(SaveDataContext);
  const manager = saveData.playerStore.storeClientManager || {};

  function handleFieldChange(field, value, type) {
    const parsedValue = type === "number" ? Number(value) : value;
    setSaveData(prev => ({
      ...prev,
      playerStore: {
        ...prev.playerStore,
        storeClientManager: { ...prev.playerStore.storeClientManager, [field]: parsedValue },
      },
    }));
  }

  var fields = []
  for (const [field, type] of STORE_CLIENT_MANAGER_FIELDS) {
    const value = manager[field] ?? defaultValueForType(type);
    fields.push(<EditableField key={field} label={field} value={value} type={type} onValueChange={(f, v) => handleFieldChange(f, v, type)} className="details-input"/>)
  }

  return (
    <div className={`store-client-manager-editor ${ className }`}>
      <div className="editable-section-fields">
        {fields}
      </div>
      {STORE_CLIENT_MANAGER_RAW_FIELDS.map(field => (
        <RawField key={field} label={field} value={manager[field]}/>
      ))}
    </div>
  );
}

export { StoreClientManagerEditor };

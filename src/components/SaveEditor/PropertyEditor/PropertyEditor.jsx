import { useContext } from "react";

import { SaveDataContext, SaveDataProvider } from "../../../context/SaveData.jsx"
// import constants from "../../../constants.js"
import * as constants from "../../../constants.js"

import { EditableField } from "../../EditableField/EditableField.jsx"

import "./PropertyEditor.css"

function PropertyEditor({propertyName, className = ""}) {
  const {saveData, setSaveData} = useContext(SaveDataContext);

  function handleFieldChange(field, value, type, property, nestedKey) {
    const parsedValue = type === "number" ? Number(value) : value;
    setSaveData(prev => {
      if (!nestedKey) {
        return { ...prev, [property]: { ...prev[property], [field]: parsedValue } };
      }
      return {
        ...prev,
        [property]: {
          ...prev[property],
          [nestedKey]: { ...prev[property][nestedKey], [field]: parsedValue },
        },
      };
    });
  }

  var propertyFields = []
  for (const [field, type, property] of constants[propertyName]) {
    var value = saveData[property][field]
    propertyFields.push(<EditableField key={field} label={field} value={type == "number" && !value ? 0 : value} type={type} onValueChange={(f, v) => handleFieldChange(f, v, type, property)}/>)
  }

  return (
    <div className={`property-editor ${ className }`}>
      {propertyFields}
    </div>
  );
}

export { PropertyEditor };
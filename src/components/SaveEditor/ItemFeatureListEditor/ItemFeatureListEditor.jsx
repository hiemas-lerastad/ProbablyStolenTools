import { useContext } from "react";

import { SaveDataContext } from "../../../context/SaveData.jsx"
import { FEATURE_FIELDS, FEATURE_CONDITION_FIELDS } from "../../../constants.js"

import { EditableField } from "../../EditableField/EditableField.jsx"
import { ContentButton } from "../../ContentButton/ContentButton.jsx"
import { InfoCard } from "../../InfoCard/InfoCard.jsx"

import {
  updateSavedItemFeature, removeSavedItemFeature, duplicateSavedItemFeature, addBlankSavedItemFeature,
} from "../../../utilities/ItemHelpers.js"

import "./ItemFeatureListEditor.css"

const CONDITION_KEYS = ["fakeCondition", "realCondition"];

function ItemFeatureListEditor({className = ""}) {
  const {saveData, setSaveData} = useContext(SaveDataContext);
  const features = saveData.playerStore.savedItemFeatureList || [];

  function handleFieldChange(index, field, value, type) {
    const parsedValue = type === "number" ? Number(value) : value;
    setSaveData(prev => updateSavedItemFeature(prev, index, feature => ({ ...feature, [field]: parsedValue })));
  }

  function handleConditionFieldChange(index, conditionKey, field, value, type) {
    const parsedValue = type === "number" ? Number(value) : value;
    setSaveData(prev => updateSavedItemFeature(prev, index, feature => ({
      ...feature,
      [conditionKey]: { ...feature[conditionKey], [field]: parsedValue },
    })));
  }

  function handleDuplicate(index) {
    setSaveData(prev => duplicateSavedItemFeature(prev, index));
  }

  function handleRemove(index) {
    setSaveData(prev => removeSavedItemFeature(prev, index));
  }

  function handleAddBlank() {
    setSaveData(prev => addBlankSavedItemFeature(prev));
  }

  return (
    <div className={`feature-list-editor ${ className }`}>
      {features.map((feature, index) => {
        var fields = []
        for (const [field, type] of FEATURE_FIELDS) {
          fields.push(<EditableField key={field} label={field} value={feature[field] ?? ""} type={type} onValueChange={(f, v) => handleFieldChange(index, f, v, type)} className="details-input"/>)
        }

        return (
          <div key={index} className="feature-card editable-section">
            <InfoCard title={feature.identifier || feature.category || `Feature ${index}`}>
              <div className="feature-card-actions">
                <ContentButton onClickFunc={() => handleDuplicate(index)} label="Duplicate" className="details-button"/>
                <ContentButton onClickFunc={() => handleRemove(index)} label="Delete" className="details-button"/>
              </div>
              <div className="editable-section-fields">
                {fields}
              </div>
              {CONDITION_KEYS.filter(key => feature[key]).map(conditionKey => (
                <div key={conditionKey} className="condition-card editable-section">
                  <div className="editable-section-heading">{conditionKey}</div>
                  <div className="editable-section-fields">
                    {FEATURE_CONDITION_FIELDS.map(([field, type]) => (
                      <EditableField key={field} label={field} value={feature[conditionKey][field] ?? ""} type={type} onValueChange={(f, v) => handleConditionFieldChange(index, conditionKey, f, v, type)} className="details-input"/>
                    ))}
                  </div>
                </div>
              ))}
            </InfoCard>
          </div>
        );
      })}
      <div className="editable-section-footer">
        <ContentButton onClickFunc={handleAddBlank} label="Add Feature" className="details-button"/>
      </div>
    </div>
  );
}

export { ItemFeatureListEditor };

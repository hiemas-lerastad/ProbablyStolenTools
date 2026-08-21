import { useContext } from "react";

import { SaveDataContext } from "../../../context/SaveData.jsx"
import { REPUTATION_FIELDS, PERK_FIELDS } from "../../../constants.js"

import { EditableField } from "../../EditableField/EditableField.jsx"
import { InfoCard } from "../../InfoCard/InfoCard.jsx"

import "./ReputationEditor.css"

function updateReputation(prev, factionIndex, updater) {
  const storeReputations = prev.playerStore.storeReputations.map((rep, i) => i === factionIndex ? updater(rep) : rep);
  return { ...prev, playerStore: { ...prev.playerStore, storeReputations } };
}

function ReputationEditor({className = ""}) {
  const {saveData, setSaveData} = useContext(SaveDataContext);
  const storeReputations = saveData.playerStore.storeReputations || [];

  function handleReputationFieldChange(factionIndex, field, value, type) {
    const parsedValue = type === "number" ? Number(value) : value;
    setSaveData(prev => updateReputation(prev, factionIndex, rep => ({ ...rep, [field]: parsedValue })));
  }

  function handlePerkFieldChange(factionIndex, perkIndex, field, value, type) {
    const parsedValue = type === "number" ? Number(value) : value;
    setSaveData(prev => updateReputation(prev, factionIndex, rep => ({
      ...rep,
      perks: rep.perks.map((perk, i) => i === perkIndex ? { ...perk, [field]: parsedValue } : perk),
    })));
  }

  return (
    <div className={`reputation-editor ${ className }`}>
      {storeReputations.map((rep, factionIndex) => {
        var repFields = []
        for (const [field, type] of REPUTATION_FIELDS) {
          repFields.push(<EditableField key={field} label={field} value={rep[field]} type={type} onValueChange={(f, v) => handleReputationFieldChange(factionIndex, f, v, type)} className="details-input"/>)
        }

        return (
          <div key={rep.factionId || factionIndex} className="reputation-card editable-section">
            <InfoCard title={rep.factionDisplay} >
              <div className="editable-section-fields">
                {repFields}
              </div>
              <div className="perks-list">
                {(rep.perks || []).map((perk, perkIndex) => {
                  var perkFields = []
                  for (const [field, type] of PERK_FIELDS) {
                    perkFields.push(<EditableField key={field} label={field} value={perk[field]} type={type} onValueChange={(f, v) => handlePerkFieldChange(factionIndex, perkIndex, f, v, type)} className="details-input"/>)
                  }

                  return (
                    <div key={perk.perkId || perkIndex} className="perk-card editable-section">
                      <div className="editable-section-heading">{perk.perkId}</div>
                      <div className="editable-section-fields">
                        {perkFields}
                      </div>
                    </div>
                  );
                })}
              </div>
            </InfoCard>
        </div>
        );
      })}
    </div>
  );
}

export { ReputationEditor };

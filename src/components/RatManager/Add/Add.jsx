import { useContext, useState, useEffect } from "react";

import { RatDataContext } from "../../../context/RatData.jsx"
import { ContentInput } from "../../ContentInput/ContentInput.jsx"
import { ContentButton } from "../../ContentButton/ContentButton.jsx"

import './Add.css'

function getHighLow(a, b) {
  return Number(a) >= Number(b)
    ? { highest: a, lowest: b, value: +(getAverage(a, b).toFixed(2))}
    : { highest: b, lowest: a, value: +(getAverage(a, b).toFixed(2))};
}

function getAverage(a, b) {
  return (parseFloat(a) + parseFloat(b)) / 2;
}

// Same field defaults used for a brand-new rat. When editing, initialData
// takes over instead - see geneDefault/nameDefault.
const GENE_DEFAULTS = {
  growthRate: "1.0",
  expectedLitter: "3.0",
  immunity: "30.0",
  maxHealth: "100.0",
  longevity: "1.0",
  hungerRate: "65.0",
};

function geneDefault(initialData, prop, side) {
  return initialData ? String(initialData[prop][side]) : GENE_DEFAULTS[prop];
}

// Pass initialData to pre-fill the form for editing an existing rat instead
// of creating a new one - onSubmit receives the built rat object either way,
// but only a fresh add appends to ratData/resets the form itself; editing
// leaves what happens with the result up to the caller (see RatCard).
function AddMenu({initialData, onSubmit}) {
  const {ratData, setRatData} = useContext(RatDataContext);

  function handleKeyDown(e) {
    if (e.key !== "Enter" || e.target.type === "submit") return;

    e.preventDefault();
    const focusable = Array.from(e.target.form.elements).filter((el) => !el.disabled);
    const next = focusable[focusable.indexOf(e.target) + 1];
    next?.focus();
  }

  function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const formJson = Object.fromEntries(formData.entries());

    const rat = {
      name: formJson.ratName,
      growthRate: getHighLow(formJson.growthGene1, formJson.growthGene2),
      expectedLitter: getHighLow(formJson.litterGene1, formJson.litterGene2),
      immunity: getHighLow(formJson.immunityGene1, formJson.immunityGene2),
      maxHealth: getHighLow(formJson.healthGene1, formJson.healthGene2),
      longevity: getHighLow(formJson.longevityGene1, formJson.longevityGene2),
      hungerRate: getHighLow(formJson.hungerGene1, formJson.hungerGene2),
    };

    if (initialData) {
      onSubmit(rat);
      return;
    }

    setRatData([...ratData, rat]);
    form.reset();
    e.target[0].focus()

    if (onSubmit) {
      onSubmit(rat)
    }
  }

  return (
    <form method="post" onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="add-form">
      <label className="add-form-question">
        Name: <ContentInput name="ratName" defaultValue={initialData ? initialData.name : "Rat"} className="add-form-input add-form-input-name details-input"/>
      </label>
      <br />
      <label className="add-form-question">
        Growth Rate: <span className="add-form-bracket">(</span><ContentInput type="number" min="0.00" step="0.001" max="1000.00" name="growthGene1" defaultValue={geneDefault(initialData, "growthRate", "highest")} className="add-form-input details-input"/><span className="add-form-spacer">|</span><ContentInput type="number" min="0.00" step="0.001" max="1000.00" name="growthGene2" defaultValue={geneDefault(initialData, "growthRate", "lowest")} className="add-form-input details-input"/><span className="add-form-bracket">)</span>
      </label>
      <br />
      <label className="add-form-question">
        Expected Litter: <span className="add-form-bracket">(</span><ContentInput type="number" min="0.00" step="0.001" max="1000.00" name="litterGene1" defaultValue={geneDefault(initialData, "expectedLitter", "highest")} className="add-form-input details-input"/><span className="add-form-spacer">|</span><ContentInput type="number" min="0.00" step="0.001" max="1000.00" name="litterGene2" defaultValue={geneDefault(initialData, "expectedLitter", "lowest")}  className="add-form-input details-input"/><span className="add-form-bracket">)</span>
      </label>
      <br />
      <label className="add-form-question">
        Immunity: <span className="add-form-bracket">(</span><ContentInput type="number" min="0.00" step="0.001" max="1000.00" name="immunityGene1" defaultValue={geneDefault(initialData, "immunity", "highest")} className="add-form-input details-input"/><span className="add-form-spacer">|</span><ContentInput type="number" min="0.00" step="0.001" max="1000.00" name="immunityGene2" defaultValue={geneDefault(initialData, "immunity", "lowest")} className="add-form-input details-input"/><span className="add-form-bracket">)</span>
      </label>
      <br />
      <label className="add-form-question">
        Max Health: <span className="add-form-bracket">(</span><ContentInput type="number" min="0.00" step="0.001" max="1000.00" name="healthGene1" defaultValue={geneDefault(initialData, "maxHealth", "highest")} className="add-form-input details-input"/><span className="add-form-spacer">|</span><ContentInput type="number" min="0.00" step="0.001" max="1000.00" name="healthGene2" defaultValue={geneDefault(initialData, "maxHealth", "lowest")} className="add-form-input details-input"/><span className="add-form-bracket">)</span>
      </label>
      <br />
      <label className="add-form-question">
        Longevity: <span className="add-form-bracket">(</span><ContentInput type="number" min="0.00" step="0.001" max="1000.00" name="longevityGene1" defaultValue={geneDefault(initialData, "longevity", "highest")} className="add-form-input details-input"/><span className="add-form-spacer">|</span><ContentInput type="number" min="0.00" step="0.001" max="1000.00" name="longevityGene2" defaultValue={geneDefault(initialData, "longevity", "lowest")} className="add-form-input details-input"/><span className="add-form-bracket">)</span>
      </label>
      <br />
      <label className="add-form-question">
        Hunger Rate: <span className="add-form-bracket">(</span><ContentInput type="number" min="0.00" step="0.001" max="1000.00" name="hungerGene1" defaultValue={geneDefault(initialData, "hungerRate", "highest")} className="add-form-input details-input"/><span className="add-form-spacer">|</span><ContentInput type="number" min="0.00" step="0.001" max="1000.00" name="hungerGene2" defaultValue={geneDefault(initialData, "hungerRate", "lowest")} className="add-form-input details-input"/><span className="add-form-bracket">)</span>
      </label>
      <hr />
      <div className="add-buttons">
        <ContentButton type="submit" label={initialData ? "Save" : "Add Rat"} className="details-button"/>
        <ContentButton type="reset" label="Reset" className="details-button"/>
      </div>
    </form>
  );
}

export { AddMenu };

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

function AddMenu({onSubmit}) {
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

    const newRat = {
      name: formJson.ratName,
      growthRate: getHighLow(formJson.growthGene1, formJson.growthGene2),
      expectedLitter: getHighLow(formJson.litterGene1, formJson.litterGene2),
      immunity: getHighLow(formJson.immunityGene1, formJson.immunityGene2),
      maxHealth: getHighLow(formJson.healthGene1, formJson.healthGene2),
      longevity: getHighLow(formJson.longevityGene1, formJson.longevityGene2),
      hungerRate: getHighLow(formJson.hungerGene1, formJson.hungerGene2),
    };

    setRatData([...ratData, newRat]);
    form.reset();
    e.target[0].focus()

    if (onSubmit) {
      onSubmit()
    }
  }

  return (
    <form method="post" onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="add-form">
      <label className="add-form-question">
        Name: <ContentInput name="ratName" defaultValue="Rat" className="add-form-input add-form-input-name details-input"/>
      </label>
      <br />
      <label className="add-form-question">
        Growth Rate: <span className="add-form-bracket">(</span><ContentInput type="number" min="0.00" step="0.001" max="1000.00" name="growthGene1" defaultValue="1.0" className="add-form-input details-input"/><span className="add-form-spacer">|</span><ContentInput type="number" min="0.00" step="0.001" max="1000.00" name="growthGene2" defaultValue="1.0" className="add-form-input details-input"/><span className="add-form-bracket">)</span>
      </label>
      <br />
      <label className="add-form-question">
        Expected Litter: <span className="add-form-bracket">(</span><ContentInput type="number" min="0.00" step="0.001" max="1000.00" name="litterGene1" defaultValue="3.0" className="add-form-input details-input"/><span className="add-form-spacer">|</span><ContentInput type="number" min="0.00" step="0.001" max="1000.00" name="litterGene2" defaultValue="3.0"  className="add-form-input details-input"/><span className="add-form-bracket">)</span>
      </label>
      <br />
      <label className="add-form-question">
        Immunity: <span className="add-form-bracket">(</span><ContentInput type="number" min="0.00" step="0.001" max="1000.00" name="immunityGene1" defaultValue="30.0" className="add-form-input details-input"/><span className="add-form-spacer">|</span><ContentInput type="number" min="0.00" step="0.001" max="1000.00" name="immunityGene2" defaultValue="30.0" className="add-form-input details-input"/><span className="add-form-bracket">)</span>
      </label>
      <br />
      <label className="add-form-question">
        Max Health: <span className="add-form-bracket">(</span><ContentInput type="number" min="0.00" step="0.001" max="1000.00" name="healthGene1" defaultValue="100.0" className="add-form-input details-input"/><span className="add-form-spacer">|</span><ContentInput type="number" min="0.00" step="0.001" max="1000.00" name="healthGene2" defaultValue="100.0" className="add-form-input details-input"/><span className="add-form-bracket">)</span>
      </label>
      <br />
      <label className="add-form-question">
        Longevity: <span className="add-form-bracket">(</span><ContentInput type="number" min="0.00" step="0.001" max="1000.00" name="longevityGene1" defaultValue="1.0" className="add-form-input details-input"/><span className="add-form-spacer">|</span><ContentInput type="number" min="0.00" step="0.001" max="1000.00" name="longevityGene2" defaultValue="1.0" className="add-form-input details-input"/><span className="add-form-bracket">)</span>
      </label>
      <br />
      <label className="add-form-question">
        Hunger Rate: <span className="add-form-bracket">(</span><ContentInput type="number" min="0.00" step="0.001" max="1000.00" name="hungerGene1" defaultValue="65.0" className="add-form-input details-input"/><span className="add-form-spacer">|</span><ContentInput type="number" min="0.00" step="0.001" max="1000.00" name="hungerGene2" defaultValue="65.0" className="add-form-input details-input"/><span className="add-form-bracket">)</span>
      </label>
      <hr />
      <div className="add-buttons">
        <ContentButton type="submit" label="Add Rat" className="details-button"/>
        <ContentButton type="reset" label="Reset" className="details-button"/>
      </div>
    </form>
  );
}

export { AddMenu };

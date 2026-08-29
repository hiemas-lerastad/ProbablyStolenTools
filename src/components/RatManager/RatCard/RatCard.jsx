import { useContext, useState, useEffect } from "react";

import { InfoCard } from "../../InfoCard/InfoCard.jsx"
import { ContentButton } from "../../ContentButton/ContentButton.jsx"
import { AddMenu } from "../Add/Add.jsx"

import "./RatCard.css"

const INVERTED_PROPERTIES = new Set(["hungerRate"]);
const GENE_FIELDS = ["value", "highest", "lowest"];

function getComparisonFlags(value, fieldStats) {
  const num = Number(value);

  const isMax = num === fieldStats.max && num != fieldStats.average
  const isMin = num === fieldStats.min && num != fieldStats.average
  const isAbove = num > fieldStats.average && num != fieldStats.average
  const isBelow = num < fieldStats.average && num != fieldStats.average

  return {
    isMax: isMax,
    isMin: isMin && !isMax,
    isAbove: num > fieldStats.average && !isMax,
    isBelow: num < fieldStats.average && !isMin,
  };
}

function getRatingClasses(flags, invert) {
  const classes = [];
  if (invert) {
    if (flags.isMax) classes.push("rat-card-gene-value--minimum");
    if (flags.isMin) classes.push("rat-card-gene-value--maximum");
    if (flags.isAbove) classes.push("rat-card-gene-value--below-average");
    else if (flags.isBelow) classes.push("rat-card-gene-value--above-average");
  } else {
    if (flags.isMax) classes.push("rat-card-gene-value--maximum");
    if (flags.isMin) classes.push("rat-card-gene-value--minimum");
    if (flags.isAbove) classes.push("rat-card-gene-value--above-average");
    else if (flags.isBelow) classes.push("rat-card-gene-value--below-average");
  }
  return classes.join(" ");
}

function getRatingScore(flags, invert) {
  let score = 0;
  if (flags.isMax && !flags.isMin) score = 2;
  else if (flags.isMin && !flags.isMax) score = -2;
  else if (flags.isAbove) score = 1;
  else if (flags.isBelow) score = -1;
  return invert ? -score : score;
}

function getRatCardRating(data, stats) {
  let total = 0;
  for (const prop of Object.keys(stats)) {
    const invert = INVERTED_PROPERTIES.has(prop);
    for (const field of GENE_FIELDS) {
      const flags = getComparisonFlags(data[prop][field], stats[prop][field]);
      total += getRatingScore(flags, invert);
    }
  }

  return total;
}

function GeneValue({data, propertyName, stats, title}) {
  const geneData = data[propertyName];
  const propStats = stats[propertyName];
  const invert = INVERTED_PROPERTIES.has(propertyName);

  return (
    <div className="rat-card-gene">
    <div className="rat-card-gene-name">{title}</div>
      <div className={`rat-card-gene-value ${getRatingClasses(getComparisonFlags(geneData.value, propStats.value), invert)}`}>{geneData.value.toFixed(2)}</div>
      <div className="rat-card-allele">
        <span className="rat-card-bracket">(</span>
        <div className={`rat-card-gene-value ${getRatingClasses(getComparisonFlags(geneData.highest, propStats.highest), invert)}`}>{geneData.highest.toFixed(2)}</div>
        <span className="rat-card-spacer">{" | "}</span>
        <div className={`rat-card-gene-value ${getRatingClasses(getComparisonFlags(geneData.lowest, propStats.lowest), invert)}`}>{geneData.lowest.toFixed(2)}</div>
        <span className="rat-card-bracket">)</span>
      </div>
    </div>
  )
}

function getRecommendation(rating) {
  if (rating >= 8) {
    return {class: "rat-card-gene-value--maximum", text: "Strong Candidate For Breeding"}
  } else if (rating > 0) {
    return {class: "rat-card-gene-value--above-average", text: "Overall Positive"}
  } else if (rating == 0) {
    return {text: "Investigate"}
  } else if (rating < -10) {
    return {class: "rat-card-gene-value--minimum", text: "Strong Candidate For Neutering"}
  } else if (rating < 0) {
    return {class: "rat-card-gene-value--below-average", text: "Overall Negative"}
  }
}

function RatCard({data, index, deleteFunc, updateFunc, stats}) {
  const [editing, setEditing] = useState(false);
  const rating = getRatCardRating(data, stats);
  const recommendation = getRecommendation(rating);

  function handleDelete() {
    if (deleteFunc) {
      deleteFunc(index)
    }
  }

  function handleSave(updatedRat) {
    if (updateFunc) {
      updateFunc(index, updatedRat)
    }
    setEditing(false)
  }

  if (editing) {
    return (
      <InfoCard title={`Edit ${data.name}`} enableClose={true} closeFunc={() => setEditing(false)} className="rat-card">
        <AddMenu initialData={data} onSubmit={handleSave}/>
      </InfoCard>
    );
  }

  return (
    <InfoCard title={data.name} enableClose={true} closeFunc={handleDelete} className="rat-card">
      <ContentButton onClickFunc={() => setEditing(true)} label="Edit" className="rat-card-edit details-button"/>
      <GeneValue data={data} propertyName="growthRate" stats={stats} title={"Growth Rate: "}/>
      <GeneValue data={data} propertyName="expectedLitter" stats={stats} title={"Expected Litter: "}/>
      <GeneValue data={data} propertyName="immunity" stats={stats} title={"Immunity: "}/>
      <GeneValue data={data} propertyName="maxHealth" stats={stats} title={"Max Health: "}/>
      <GeneValue data={data} propertyName="longevity" stats={stats} title={"Longevity: "}/>
      <GeneValue data={data} propertyName="hungerRate" stats={stats} title={"Hunger Rate: "}/>
      <div className={`rat-card-rating ${ recommendation.class }`}>{recommendation.text}</div>
    </InfoCard>
  );
}

export { RatCard };
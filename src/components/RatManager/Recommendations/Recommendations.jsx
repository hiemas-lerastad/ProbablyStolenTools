import { useContext, useState, useEffect } from "react";

import { RatDataContext } from "../../../context/RatData.jsx"
import { RatCard } from "../RatCard/RatCard.jsx"
import { InfoCard } from "../../InfoCard/InfoCard.jsx"
import { AddMenu } from "../Add/Add.jsx"

import "./Recommendations.css"

function getValues(data, prop) {
  return data.map(item => Number(item[prop]));
}

function getIndexesWhere(data, prop, predicate) {
  return data.reduce((indexes, item, index) => {
    if (predicate(Number(item[prop]))) indexes.push(index);
    return indexes;
  }, []);
}

function getAverage(data, prop) {
  const values = getValues(data, prop);
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function getMax(data, prop) {
  return Math.max(...getValues(data, prop));
}

function getMin(data, prop) {
  return Math.min(...getValues(data, prop));
}

function getMaxIndexes(data, prop) {
  const max = getMax(data, prop);
  return getIndexesWhere(data, prop, v => v === max);
}

function getMinIndexes(data, prop) {
  const min = getMin(data, prop);
  return getIndexesWhere(data, prop, v => v === min);
}

function getAboveAverageIndexes(data, prop) {
  const avg = getAverage(data, prop);
  return getIndexesWhere(data, prop, v => v > avg);
}

function getBelowAverageIndexes(data, prop) {
  const avg = getAverage(data, prop);
  return getIndexesWhere(data, prop, v => v < avg);
}

const GENE_PROPERTIES = ["growthRate", "expectedLitter", "immunity", "maxHealth", "longevity", "hungerRate"];
const GENE_FIELDS = ["value", "highest", "lowest"];

function getColonyStats(ratData) {
  const stats = {};
  for (const prop of GENE_PROPERTIES) {
    const propData = ratData.map((rat) => rat[prop]);
    stats[prop] = {};
    for (const field of GENE_FIELDS) {
      stats[prop][field] = {
        average: getAverage(propData, field),
        max: getMax(propData, field),
        min: getMin(propData, field),
      };
    }
  }
  return stats;
}

function ReccomendationsMenu() {
  const {ratData, setRatData} = useContext(RatDataContext);
  const [addFormActive, setAddFormActive] = useState(false)
  const stats = getColonyStats(ratData);
  let ratCards = [];

  function deleteCard(index) {
    setRatData(ratData.filter((_, i) => i !== index))
  }

  function updateCard(index, updatedRat) {
    setRatData(ratData.map((rat, i) => i === index ? updatedRat : rat))
  }

  for (const [index, rat] of ratData.entries()) {
    ratCards.push(<RatCard key={index} data={rat} index={index} deleteFunc={deleteCard} updateFunc={updateCard} stats={stats}/>);
  }

  return (
    <div className="reccomendations">
      {ratData && !addFormActive &&
        <InfoCard title="Add Rat" enableClose={true} closeFunc={() => {setAddFormActive(true)}} iconName="plus" className="add-card"></InfoCard>
      }
      {ratData && addFormActive &&
        <InfoCard title="Add Rat" enableClose={true} closeFunc={() => {setAddFormActive(false)}} className="add-card" >
          <AddMenu />
        </InfoCard>
      }
      <div className="rat-card-list">
        {ratCards}
      </div>
    </div>
  )
}

export { ReccomendationsMenu };
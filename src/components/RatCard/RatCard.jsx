import { useContext } from "react";

import { InfoPanel } from "../components.js"
import { getRecommendation } from "../../utilities/RatHelpers.js"
import { RatDataContext } from "../../context/RatData.jsx"

import "./RatCard.css"

function tierClassName(tier) {
  return tier ? `rat-tier-${tier}` : "";
}

function formatStat(value, decimals = 2) {
  if (value == null) return "N/A";
  return typeof value === "number" ? value.toFixed(decimals) : value;
}

function RatStat({ label, fieldKey, value, rat, decimals }) {
  const tier = rat.tiers?.[fieldKey];

  return (
    <span className={`rat-stat ${tierClassName(tier)}`}>
      {label ? label + ":" : ""} {formatStat(rat[fieldKey] ?? value, decimals)}
    </span>
  );
}

function RatGene({ label, field, rat }) {
    const higherKeyName = field + "Higher"
    const lowerKeyName = field + "Lower"

    const valueTier = rat.tiers?.[field];
    const higherTier = rat.tiers?.[higherKeyName];
    const lowerTier = rat.tiers?.[lowerKeyName];

    return (
        <div className="rat-card-gene">
          <div className="rat-card-gene-name">{label}:</div>
          <div className={`rat-card-gene-value ${tierClassName(valueTier)}`}>{formatStat(rat[field])}</div>
          <div className="rat-card-allele">
            <span className="rat-card-bracket">(</span>
            <div className={`rat-card-gene-value ${tierClassName(lowerTier)}`}>{formatStat(rat[lowerKeyName])}</div>
            <span className="rat-card-spacer">{" | "}</span>
            <div className={`rat-card-gene-value ${tierClassName(higherTier)}`}>{formatStat(rat[higherKeyName])}</div>
            <span className="rat-card-bracket">)</span>
          </div>
        </div>
    );
}

function RatCard({ rat }) {
    const { recommendationFields } = useContext(RatDataContext);
    const recommendation = getRecommendation(rat.totalScore, recommendationFields);

    return (
        <InfoPanel title={`${rat.customName || rat.name} (${rat.sex})`} collapsable={true} className="details-card rat-card">
          {recommendation &&
            <div className={`rat-recommendation ${tierClassName(recommendation.tier)}`}>{recommendation.label}</div>
          }
          <RatStat fieldKey={"age"} label={"Age"} rat={rat} decimals={0} value={0} />
          <span><RatStat fieldKey={"health"} label={"Health"} rat={rat} />/<RatStat fieldKey={"maxHealth"} rat={rat} /></span>
          <span><RatStat fieldKey={"hunger"} label={"Hunger"} rat={rat} />/<RatStat fieldKey={"maxHunger"} rat={rat} /></span>
          <RatGene label={"Growth Rate"} field={"growthRate"} rat={rat} />
          <RatGene label={"Expected Litter Size"} field={"litterSize"} rat={rat} />
          <RatGene label={"Immunity"} field={"immunity"} rat={rat} />
          <RatGene label={"Max Health"} field={"maxHealth"} rat={rat} />
          <RatGene label={"Longevity"} field={"longevity"} rat={rat} />
          <RatGene label={"Hunger Rate"} field={"hungerRate"} rat={rat} />
          {rat.immunity < 25 &&
            <span className="rat-tier-minimum">[Immunocomprimised]</span>
          }
          {rat.immunity > 50 &&
            <span className="rat-tier-aboveAverage">[Strong Immunity]</span>
          }
          {rat.diseased &&
            <span className="rat-tier-minimum">[Diseased]</span>
          }
          {rat.parentItem && <div className="rat-parent-item">Container: {rat.parentItem}</div>}
        </InfoPanel>
    );
}

export { RatCard };

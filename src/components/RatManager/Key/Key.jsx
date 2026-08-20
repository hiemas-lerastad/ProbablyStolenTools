import { useContext, useState, useEffect } from "react";

import { InfoCard } from "../../InfoCard/InfoCard.jsx"

import './Key.css'

function Key() {

  return (
    <InfoCard title="Key" enableClose={false} className="key-card">
      <div className="key-row rat-card-gene">
        <div className="key-label">
          Maximum Value: 
        </div>
        <div className="key-value rat-card-gene-value--maximum">
          1.0
        </div>
      </div>
      <div className="key-row rat-card-gene">
        <div className="key-label">
          Above Average: 
        </div>
        <div className="key-value rat-card-gene-value--above-average">
          1.0
        </div>
      </div>
      <div className="key-row rat-card-gene">
        <div className="key-label">
          Average: 
        </div>
        <div className="key-value rat-card-gene-value">
          1.0
        </div>
      </div>
      <div className="key-row rat-card-gene">
        <div className="key-label">
          Below Average: 
        </div>
        <div className="key-value rat-card-gene-value--below-average">
          1.0
        </div>
      </div>
      <div className="key-row rat-card-gene">
        <div className="key-label">
          Minimum Value: 
        </div>
        <div className="key-value rat-card-gene-value--minimum">
          1.0
        </div>
      </div>
    </InfoCard>
  );
}

export { Key };
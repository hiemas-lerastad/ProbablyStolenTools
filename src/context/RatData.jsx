import { createContext, useContext, useState, useMemo } from 'react';

import { SaveDataContext } from '../context/SaveData.jsx'
import { RAT_EXPORT_FIELDS, RAT_GENE_FIELDS, RAT_SCORE_FIELDS, RAT_RECOMMENDATION_FIELDS } from '../utilities/constants.js'
import { collectAndScoreRats } from '../utilities/RatHelpers.js'

const EMPTY_RATS = { male: [], female: [], all: [] };

export const RatDataContext = createContext({
  ...EMPTY_RATS,
  scoreFields: RAT_SCORE_FIELDS,
  updateScoreTier: () => undefined,
  recommendationFields: RAT_RECOMMENDATION_FIELDS,
  updateRecommendationField: () => undefined,
})

export const RatDataProvider = ({children}) => {
  const { saveData } = useContext(SaveDataContext);
  const [scoreFields, setScoreFields] = useState(RAT_SCORE_FIELDS);
  const [recommendationFields, setRecommendationFields] = useState(RAT_RECOMMENDATION_FIELDS);

  const { male, female } = useMemo(() => {
    if (!saveData) return EMPTY_RATS;
    return collectAndScoreRats(saveData, RAT_EXPORT_FIELDS, RAT_GENE_FIELDS, scoreFields);
  }, [saveData, scoreFields]);

  const all = useMemo(() => [...male, ...female], [male, female]);

  function updateScoreTier(statKey, tier, value) {
    setScoreFields(prev => ({
      ...prev,
      [statKey]: { ...prev[statKey], [tier]: Number(value) },
    }));
  }

  function updateRecommendationField(tier, field, value) {
    setRecommendationFields(prev => prev.map(r => r.tier === tier
      ? { ...r, [field]: field === "threshold" ? Number(value) : value }
      : r
    ));
  }

  return (
    <RatDataContext.Provider value={{ male, female, all, scoreFields, updateScoreTier, recommendationFields, updateRecommendationField }}>
      {children}
    </RatDataContext.Provider>
  )
}

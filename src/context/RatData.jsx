import { createContext, useContext, useState, useMemo } from 'react';

import { SaveDataContext } from '../context/SaveData.jsx'
import { RAT_EXPORT_FIELDS, RAT_GENE_FIELDS, RAT_SCORE_FIELDS, RAT_RECOMMENDATION_FIELDS, RAT_PRESETS } from '../utilities/constants.js'
import { collectAndScoreRats } from '../utilities/RatHelpers.js'

const EMPTY_RATS = { male: [], female: [], all: [] };
const CUSTOM_PRESETS_KEY = "ratManager.customPresets";

function loadCustomPresets() {
  try {
    const raw = localStorage.getItem(CUSTOM_PRESETS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCustomPresets(presets) {
  localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(presets));
}

export const RatDataContext = createContext({
  ...EMPTY_RATS,
  scoreFields: RAT_SCORE_FIELDS,
  updateScoreTier: () => undefined,
  recommendationFields: RAT_RECOMMENDATION_FIELDS,
  updateRecommendationField: () => undefined,
  presets: RAT_PRESETS,
  applyPreset: () => undefined,
  savePreset: () => undefined,
  deletePreset: () => undefined,
})

export const RatDataProvider = ({children}) => {
  const { saveData } = useContext(SaveDataContext);
  const [scoreFields, setScoreFields] = useState(RAT_SCORE_FIELDS);
  const [recommendationFields, setRecommendationFields] = useState(RAT_RECOMMENDATION_FIELDS);
  const [customPresets, setCustomPresets] = useState(loadCustomPresets);

  const { male, female } = useMemo(() => {
    if (!saveData) return EMPTY_RATS;
    return collectAndScoreRats(saveData, RAT_EXPORT_FIELDS, RAT_GENE_FIELDS, scoreFields);
  }, [saveData, scoreFields]);

  const all = useMemo(() => [...male, ...female], [male, female]);
  const presets = useMemo(() => [...RAT_PRESETS, ...customPresets], [customPresets]);

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

  function applyPreset(preset) {
    setScoreFields(structuredClone(preset.scoreFields));
    setRecommendationFields(structuredClone(preset.recommendationFields));
  }

  function savePreset(name) {
    const preset = { name, custom: true, scoreFields: structuredClone(scoreFields), recommendationFields: structuredClone(recommendationFields) };
    setCustomPresets(prev => {
      const next = [...prev.filter(p => p.name !== name), preset];
      saveCustomPresets(next);
      return next;
    });
  }

  function deletePreset(name) {
    setCustomPresets(prev => {
      const next = prev.filter(p => p.name !== name);
      saveCustomPresets(next);
      return next;
    });
  }

  return (
    <RatDataContext.Provider value={{ male, female, all, scoreFields, updateScoreTier, recommendationFields, updateRecommendationField, presets, applyPreset, savePreset, deletePreset }}>
      {children}
    </RatDataContext.Provider>
  )
}

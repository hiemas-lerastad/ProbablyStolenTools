import { createContext, useState, useEffect } from 'react';

const STORAGE_KEY = "ratData";

export const RatDataContext = createContext([[], () => []])

export const RatDataProvider = ({children}) => {
  const [ratData, setRatData] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ratData));
  }, [ratData]);

  return (
    <RatDataContext.Provider value={{ ratData, setRatData }}>
      {children}
    </RatDataContext.Provider>
  )
}
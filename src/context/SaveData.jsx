import { createContext, useState, useEffect } from 'react';

export const SaveDataContext = createContext([undefined, () => undefined])

export const SaveDataProvider = ({children}) => {
  const [saveData, setSaveData] = useState(() => undefined);

  return (
    <SaveDataContext.Provider value={{ saveData, setSaveData }}>
      {children}
    </SaveDataContext.Provider>
  )
}
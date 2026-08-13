import { createContext, useState } from 'react';

export const RatDataContext = createContext(['', () => ''])

export const RatDataProvider = ({children}) => {
	const [ratData, setRatData] = useState({})

	return (
		<RatDataContext.Provider value={{ ratData, setRatData }}>
			{children}
		</RatDataContext.Provider>
	)
}
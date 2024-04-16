import React, { createContext, useState, useContext, useEffect } from 'react';
import { debounce } from 'lodash';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const [data, setData] = useState(() => {
        const savedData = sessionStorage.getItem('appData');
        return savedData ? JSON.parse(savedData) : {};
    });

    useEffect(() => {
        const saveData = debounce(() => {
            sessionStorage.setItem('appData', JSON.stringify(data));
        }, 500)
        saveData();
        return () => saveData.cancel();
    }, [data])

    return (
        <DataContext.Provider value={{ data, setData }}>
            {children}
        </DataContext.Provider>
    );
};

import React, { createContext, useContext, useState } from 'react';

const UIContext = createContext();

export const UIProvider = ({ children }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <UIContext.Provider value={{
      isSearchOpen,
      setIsSearchOpen,
    }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => useContext(UIContext);

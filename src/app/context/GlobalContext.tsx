"use client";

import React, { createContext, useContext, useState } from "react";

interface GlobalContextProps {
  loading: boolean;
  showSideBar: boolean;
  setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>;
}

const GlobalContext = createContext<GlobalContextProps | undefined>(undefined);

export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(false);
  const [showSideBar, setShowSidebar] = useState(true);

  return (
    <GlobalContext.Provider value={{ loading, setShowSidebar, showSideBar }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobal must be used within a GlobalProvider");
  }

  const { loading, showSideBar, setShowSidebar } = context;
  return { loading, showSideBar, setShowSidebar };
};

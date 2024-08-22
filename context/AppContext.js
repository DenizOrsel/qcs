import React, { createContext, useState } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [region, setRegion] = useState("");
  const [domainname, setDomainname] = useState("");
  const [dbConfig, setDbConfig] = useState(null);
  const [roles, setRoles] = useState([]);

  return (
    <AppContext.Provider
      value={{
        region,
        setRegion,
        domainname,
        setDomainname,
        dbConfig,
        setDbConfig,
        roles,
        setRoles,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
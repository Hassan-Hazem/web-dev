import { createContext, useState } from "react";

export const CommunityContext = createContext();

export function CommunityProvider({ children }) {
  const [communities, setCommunities] = useState([]);

  const addCommunity = (community) => {
    setCommunities([...communities, community]);
  };

  return (
    <CommunityContext.Provider value={{ communities, addCommunity }}>
      {children}
    </CommunityContext.Provider>
  );
}

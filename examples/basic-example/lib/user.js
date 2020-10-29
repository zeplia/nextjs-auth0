import React, { useState, useEffect, useContext, createContext } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children, user: initialUser }) => {
  const [user, setUser] = useState(() => initialUser); // if used withAuth, initialUser is populated
  const [loading, setLoading] = useState(() => !initialUser); // if initialUser is populated, no loading required

  useEffect(() => {
    if (user) return; // if initialUser is populated, no loading required

    (async () => {
      const response = await fetch('/api/me');
      setUser(await response.json());
      setLoading(false);
    })();
  }, [user]);

  return <UserContext.Provider value={{ user, loading }}>{children}</UserContext.Provider>;
};

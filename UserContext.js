import { createContext, useEffect, useState } from "react";

export const UserContext = createContext();

const Context = ({ children }) => {
  const [user, setUser] = useState(() => ({
    loggedIn: null,
  }));

  useEffect(() => {
    fetch(`http://fog-of-war-auth.onrender.com/home`, {
      credentials: "include",
    })
      .then(response => response.json())
      .then(data => {
        console.log({ ...data });
        setUser({ ...data });
      });
  }, []);

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

export default Context;
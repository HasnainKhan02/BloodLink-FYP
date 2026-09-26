import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);


export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on application mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("bloodlink_token");
      const savedUser = localStorage.getItem("bloodlink_user");

      if (savedToken && savedUser && savedUser !== "undefined") {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error("Session restore error:", e);
      localStorage.removeItem("bloodlink_token");
      localStorage.removeItem("bloodlink_user");
    } finally {
      setLoading(false);
    }
  }, []);

  const loginSession = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem("bloodlink_token", userToken);
    localStorage.setItem("bloodlink_user", JSON.stringify(userData));
  };

  const logoutSession = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("bloodlink_token");
    localStorage.removeItem("bloodlink_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        setToken,
        isAuthenticated: !!token,
        loading,
        loginSession,
        logoutSession,
      }}
    >
      {!loading ? (
        children
      ) : (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-rose-500 font-bold">
          Loading BloodLink...
        </div>
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      token: null,
      setToken: () => {},
      isAuthenticated: false,
      loading: false,
      loginSession: () => {},
      logoutSession: () => {},
    };
  }
  return context;
};
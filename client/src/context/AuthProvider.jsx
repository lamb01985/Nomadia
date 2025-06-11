// @ts-check
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext.jsx";
import { BASE_URL as API_BASE } from "../config"; // Import dynamic base URL

/**
 * AuthProvider component to manage user auth state and provide context.
 * @param {{ children: import('react').ReactNode }} props
 * @returns {import('react').ReactElement}
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const refreshUser = useCallback(async () => {
    const res = await fetch(`${API_BASE}/api/me`, {
      credentials: "include", // Ensures session cookie is sent
    });
    if (res.ok) {
      setUser(await res.json());
    } else {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const logout = async () => {
    await fetch(`${API_BASE}/api/logout`, {
      method: "GET",
      credentials: "include", // Important for clearing the session
    });
    setUser(null);
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ user, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

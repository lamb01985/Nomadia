import { useState } from 'react';
import { StyledEngineProvider } from '@mui/material/styles';
import { useAuth } from './context/AuthContext';
import { useNavigate } from "react-router-dom";
import App from './components/LoginForm';
import { BASE_URL } from './config';

/**
 * Login page component. Handles login form submission using useAuth.
 * @returns {import('react').ReactElement}
 */
export default function Login() {
  const [error, setError] = useState("");
  const { refreshUser } = useAuth()
  const  navigate  = useNavigate()


  /**
   * Handles login form submission.
   * @param {FormData} formData
   * @returns {Promise<void>}
   */
  async function handleSubmit(formData) {
    setError("");
    const email = formData.get("email");
    const password = formData.get("password");

    try {
    const res = await fetch(`${BASE_URL}/api/login`, { // API_BASE is defined here
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      await refreshUser();
      navigate("/");
    } else {
      const err = await res.json();
      throw new Error(err.detail || "Login failed");
    }

    }


    catch (err) {
      setError(err.message);
    }
  }

  return (
    <main>
      <StyledEngineProvider injectFirst>
        <App handleSubmit={handleSubmit}/>
     </StyledEngineProvider>
    </main>
  );
}

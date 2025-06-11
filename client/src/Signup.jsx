import React from 'react';
import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useNavigate } from "react-router-dom";
import { StyledEngineProvider } from '@mui/material/styles';
import App from "./components/SignupForm";

const API_BASE = "http://localhost:8000";


/**
 * Signup page component. Handles signup form submission using useAuth.
 * @returns {import('react').ReactElement}
 */
export default function Signup() {
  const [error, setError] = useState("");
  const { refreshUser } = useAuth()
  const  navigate  = useNavigate()

  /**
   * Handles signup form submission.
   * @param {React.FormEvent<HTMLFormElement>} event
   * @returns {Promise<void>}
   */
  async function handleSubmit(formData) {
    setError("");
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');



  if (!name || !email || !password) {
    setError("All fields are required.");
    return;
  }

    try {
    const res = await fetch(`${API_BASE}/api/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password, name }),
    });

    if (res.ok) {
      await refreshUser();
      navigate("/");
    } else {
      const err = await res.json();
      throw new Error(err.detail || "Signup failed");
    }

    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main>
      <StyledEngineProvider injectFirst>
        <App handleSubmit={handleSubmit} />
      </StyledEngineProvider>
    </main>
  );
}

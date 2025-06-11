import React from 'react';
import { useAuth } from './context/AuthContext';
import { useNavigate } from "react-router-dom";
import { StyledEngineProvider } from '@mui/material/styles';
import App from "./components/SignupForm";
import { BASE_URL } from "./config.js";

/**
 * Signup page component. Handles signup form submission using useAuth.
 * @returns {import('react').ReactElement}
 */
export default function Signup() {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  /**
   * Handles signup form submission.
   * @param {FormData} formData
   * @returns {Promise<void>}
   */
  async function handleSubmit(formData) {
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');

    if (!name || !email || !password) {
      alert("All fields are required.");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
        credentials: "include", // Ensures the session cookie is set
      });

      if (res.ok) {
        await refreshUser();     // Re-hydrate user session from server
        navigate("/");           // Redirect after successful signup
      } else {
        const err = await res.json();
        throw new Error(err.detail || "Signup failed");
      }

    } catch (err) {
      alert(err.message);
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

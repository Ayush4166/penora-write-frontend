import React, { useState } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
const API_URL = process.env.REACT_APP_API_URL || "https://penora-write-backend-production.up.railway.app";
function AuthForm({ onAuth }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const endpoint = isSignup ? "/signup" : "/login";
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        // Login: pass email (prefer backend field, fallback to username if not present)
        if (!isSignup && data.access_token) {
          onAuth(data.access_token, username, data.email || username);
        }
        if (isSignup) {
          setIsSignup(false);
          setUsername("");
          setPassword("");
          alert("Account created! Now login.");
        }
      } else {
        setError(data.detail || "Error occurred!");
      }
    } catch (err) {
      setError("Network error");
    }
    setLoading(false);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
  setLoading(true);
  setError("");
  try {
    const res = await fetch(`${API_URL}/google-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential: credentialResponse.credential }),
    });
    const data = await res.json();

    if (res.ok && data.access_token) {
      // Save token like normal login
      localStorage.setItem("token", data.access_token);
      onAuth(data.access_token, data.username || "", data.email || "");
    } else {
      setError(data.detail || "Google login failed");
    }
  } catch (err) {
    setError("Google login error: " + err.message);
  }
  setLoading(false);
};

  const handleGoogleError = () => {
    setError("Google login failed");
  };

  // THEME AND LAYOUT
  return (
    <GoogleOAuthProvider clientId="171574297670-8l66iotnl0v99sb4f1dqo88642bm71sn.apps.googleusercontent.com">
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg,#e6eafa 0%,#fdfdfd 100%)"
        }}
      >
        <div
          style={{
            minWidth: 340,
            maxWidth: 400,
            width: "93vw",
            borderRadius: 32,
            background: "rgba(255,255,255,0.95)",
            boxShadow: "0 10px 26px rgba(44,52,190,0.09)",
            padding: "38px 35px 32px 35px",
            textAlign: "center"
          }}
        >
          {/* App Icon/Brand */}
          <div style={{ marginBottom: 32 }}>
            <span
              style={{
                fontSize: 50,
                background: "linear-gradient(120deg,#6a97f8 40%,#c9defa 80%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: 900
              }}
            >
              ⌘
            </span>
          </div>
          <div
            style={{
              fontWeight: 700,
              fontSize: "2rem",
              color: "#29324a",
              marginBottom: 12
            }}
          >
            Penora Write
          </div>
          <div
            style={{ color: "#7387ae", fontSize: "1.09em", marginBottom: 20 }}
          >
            {isSignup ? "Sign up to continue" : "Sign in to continue"}
          </div>
          <form onSubmit={handleSubmit} style={{ marginBottom: 26 }}>
            <input
              type="text"
              placeholder="Email"
              autoFocus
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: "100%",
                marginBottom: 15,
                padding: "15px",
                borderRadius: 14,
                border: "none",
                background: "#f7faff",
                boxShadow: "0 1.5px 12px 0px rgba(43,71,155,0.03)",
                fontSize: "1.12rem"
              }}
            />
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              maxLength={72}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                marginBottom: 13,
                padding: "15px",
                borderRadius: 14,
                border: "none",
                background: "#f7faff",
                boxShadow: "0 1.5px 12px 0px rgba(43,71,155,0.025)",
                fontSize: "1.12rem"
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                fontWeight: 700,
                fontSize: "1.12rem",
                borderRadius: 13,
                border: "none",
                background: loading
                  ? "#c3d8fc"
                  : "linear-gradient(90deg,#84a6fa 0%,#658dff 100%)",
                color: "#fff",
                boxShadow: "0 2px 8px rgba(77,98,183,0.04)",
                cursor: loading ? "not-allowed" : "pointer",
                marginTop: 2,
                marginBottom: 2,
                letterSpacing: "0.02em",
                transition: "background 0.15s"
              }}
            >
              {loading
                ? "Processing..."
                : isSignup
                ? "Sign Up"
                : "Login"}
            </button>
          </form>

          <div style={{ marginBottom: 18 }}>
            <div
              style={{
                color: "#b2bacc",
                marginBottom: 10,
                fontSize: "0.93em"
              }}
            >
              — or use —
            </div>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="filled_black"
              text="signin_with"
              shape="pill"
            />
          </div>

          <div style={{ marginTop: 20, color: "#638cff", fontSize: "1.05em" }}>
            {isSignup ? (
              <span>
                Already have an account?{" "}
                <button
                  style={{
                    border: 0,
                    background: "none",
                    color: "#4263eb",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "1.01em"
                  }}
                  onClick={() => setIsSignup(false)}
                >
                  Login
                </button>
              </span>
            ) : (
              <span>
                New user?{" "}
                <button
                  style={{
                    border: 0,
                    background: "none",
                    color: "#4263eb",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "1.01em"
                  }}
                  onClick={() => setIsSignup(true)}
                >
                  Create account
                </button>
              </span>
            )}
          </div>

          {error && (
            <div style={{ color: "#cc1122", marginTop: 12, fontSize: "1.07em" }}>
              {typeof error === "string"
                ? error
                : error.detail || error.msg || JSON.stringify(error)}
            </div>
          )}
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

export default AuthForm;

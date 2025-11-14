import React from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "60px", color: "#ffffff" }}>
      <h1 style={{ color: "#ffffff" }}>Welcome to AutoMeet</h1>
      <p style={{ color: "#b0b0b0", fontSize: "1.1em" }}>Plan, schedule, and organize meetings easily!</p>

      <button
        onClick={() => navigate("/login")}
        style={{
          margin: "10px",
          padding: "10px 20px",
          background: "#ffd700",
          color: "#1a1a1a",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontWeight: "600",
        }}
      >
        Login
      </button>

      <button
        onClick={() => navigate("/signup")}
        style={{
          margin: "10px",
          padding: "10px 20px",
          border: "2px solid #ffd700",
          color: "#ffd700",
          borderRadius: "5px",
          background: "transparent",
          cursor: "pointer",
          fontWeight: "600",
        }}
      >
        Signup
      </button>
    </div>
  );
}

import React from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "60px" }}>
      <h1>Welcome to AutoMeet</h1>
      <p>Plan, schedule, and organize meetings easily!</p>

      <button
        onClick={() => navigate("/login")}
        style={{
          margin: "10px",
          padding: "10px 20px",
          background: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
        }}
      >
        Login
      </button>

      <button
        onClick={() => navigate("/login")}
        style={{
          margin: "10px",
          padding: "10px 20px",
          border: "1px solid #007bff",
          color: "#007bff",
          borderRadius: "5px",
          background: "transparent",
        }}
      >
        Signup
      </button>
    </div>
  );
}

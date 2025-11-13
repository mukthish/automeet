import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../App";
import { logout } from "../services/auth";
import logo from "../assets/logo.png";

export default function Header() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setUser(null);
    navigate("/");
  };

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "15px 20px",
        background: "#007bff",
        color: "white",
      }}
    >
      <div
        onClick={() => navigate("/")}
        style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
      >
        <img src={logo} alt="AutoMeet Logo" style={{ height: "40px" }} />
        <h2 style={{ marginLeft: "10px" }}>AutoMeet</h2>
      </div>

      <nav style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        {!user ? (
          <>
            <Link
              to="/login"
              style={{
                color: "white",
                textDecoration: "none",
              }}
            >
              Login
            </Link>
            <Link
              to="/signup"
              style={{ color: "white", textDecoration: "none" }}
            >
              Signup
            </Link>
          </>
        ) : (
          <>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <span style={{ fontWeight: "bold" }}>{user.name}</span>
              <span style={{ fontSize: "0.85em", opacity: 0.9 }}>{user.company}</span>
            </div>
            <button
              onClick={handleLogout}
              style={{
                background: "transparent",
                border: "1px solid white",
                color: "white",
                padding: "6px 12px",
                borderRadius: "5px",
                cursor: "pointer"
              }}
            >
              Sign Out
            </button>
          </>
        )}
      </nav>
    </header>
  );
}
